---
title: bcrypt 雜湊被 shell 吃掉,而且驗證也會一起被吃掉
date: 2026-08-14
description: 雙引號裡的 $2b$10$ 會被當成位置參數展開。真正危險的不是寫壞，是同一段腳本裡的驗證式也壞成一樣的值，於是比對成功、回報「已更新」。
slug: bcrypt-shell-expansion
tags:
  - bash
  - bcrypt
  - 密碼
toc: true
# 明確宣告。Hugo 缺這個欄位時視同已發布，會跳過 staging 檢視。
draft: false
# 白名單:能否離開內網(與 draft 分層,缺欄位視同不發布)
publish: true
hook: "腳本說「已更新，驗證通過」。但密碼是壞的。"
takeaway: "任何含 `$` 的秘密（bcrypt、部分 JWT、某些 API key），在 shell 裡一律用單引號、引號 heredoc 或 stdin。而且驗收要用真的登入一次，不要相信腳本自己說的「已更新」。"
key_points:
  - "bcrypt 雜湊一定以 `$2` 開頭，放進 shell 雙引號裡每個 `$` 都是變數展開的開關，`$2b$10$…` 會只剩 `b0`"
  - "`set -u` 抓得到（會報 unbound variable），但多數腳本沒開"
  - "**寫入與驗證在同一段腳本裡會壞成同一個值**，於是比對成功、回報「已更新」"
---

批次改一批自架服務的密碼,九個服務裡有兩個改完登不進去。
查了資料庫,存進去的雜湊**開頭少了一截**。

更麻煩的是:腳本自己回報「已更新,驗證通過」。

## 症狀

寫進設定檔或資料庫的 bcrypt 雜湊變成殘缺值:

```
預期  $2b$10$EXAMPLEonlyNotARealHash000000
實際  b0
```

有時候不會這麼乾淨,會是 `b0` 後面接著雜湊的一部分 —— 取決於雜湊裡剛好有哪些字元。
共通點是**開頭的 `$2b$10$` 不見了**。

## 原因

bcrypt 雜湊的格式是 `$<演算法>$<成本>$<鹽+雜湊>`,所以它**一定**以 `$2` 開頭,
而且中間還有更多 `$`。放進 shell 的雙引號裡,每一個 `$` 都是變數展開的開關。

```bash
echo "password: $2b$10$EXAMPLEonlyNotARealHash000000"
```

```
password: b0
```

shell 是這樣讀的:

| 片段 | shell 的解讀 | 展開結果 |
|---|---|---|
| `$2` | 位置參數 2 | 空字串 |
| `b` | 字面 | `b` |
| `$1` | 位置參數 1 | 空字串 |
| `0` | 字面 | `0` |
| `$EXAMPLEonly…` | 變數名稱(英數與底線都是合法字元) | 空字串 |

剩下 `b0`。

> 本文的範例雜湊是**刻意造的假值** —— 長度不符合 bcrypt 的規格,
> 不可能是任何東西的真實雜湊。展開行為完全相同,因為關鍵在那幾個 `$`,
> 不在雜湊本身合不合法。

**預設情況下不會有任何錯誤訊息** —— 未設定的位置參數不是錯誤,它就是空字串。

唯一的例外是 `set -u`:

```bash
$ bash -c 'set -u; echo "password: $2b$10$abcdefg"'
bash: line 1: $2: unbound variable
```

所以**開 `set -u` 的腳本會當場炸掉,而不是默默寫進壞值**。
這是我事後才意識到的:如果那批腳本一開始就有 `set -euo pipefail`,
根本不會有後面那一整段。

## 真正危險的地方:驗證會一起壞掉

如果「寫入」和「驗證」寫在同一段腳本裡、又都用雙引號:

```bash
# 寫入
WROTE="$2b$10$EXAMPLEonlyNotARealHash000000"

# 驗證：比對寫進去的值和預期值
EXPECT="$2b$10$EXAMPLEonlyNotARealHash000000"

[ "$WROTE" = "$EXPECT" ] && echo "已更新 ✓"
```

```
寫入的值 = [b0]
驗證的值 = [b0]
已更新 ✓
```

**兩邊被同樣的規則吃成同樣的殘值,所以比對成功。**

這比單純寫壞嚴重得多:寫壞了你下次登入就會發現;但腳本明確告訴你「驗證通過」,
你就不會再去看。我是直到真的去登入那個服務,才知道前面那句「已更新」是假的。

> **驗收一律用「真的做一次那件事」。**
> 改密碼就去登入一次,不要只比對資料庫裡的字串 ——
> 比對用的那個字串,可能和寫進去的值壞在同一個地方。

## 解法

核心原則:**別讓雜湊經過 shell 的雙引號**。

### 放進單引號變數,再讓工具自己處理

```bash
H='$2b$10$EXAMPLEonlyNotARealHash000000'
sed -i "s|PLACEHOLDER|$H|" config.yml
```

單引號**完全不展開**,所以 `H` 拿到的是完整字串。
外層的 `"$H"` 是展開一個已經正確的變數,沒有問題。

⚠️ 雜湊裡若含 `/` 或 `&`,`sed` 的替換字串會另有意義 ——
分隔符用 `|` 只解決前者。更保險的是不要用 `sed`。

### 引號 heredoc(分隔符加引號)

```bash
psql -U app -d app <<'SQL'
UPDATE users SET password = '$2b$10$EXAMPLEonlyNotARealHash000000'
WHERE email = 'me@example.com';
SQL
```

`<<'SQL'` 的**引號是關鍵**。寫成 `<<SQL` 的話 heredoc 內容一樣會被展開,
一樣會壞。

同一招適用於 `sqlite3`:

```bash
sqlite3 db.sqlite3 <<'SQL'
UPDATE user SET password_hash = '$2b$10$…' WHERE id = 1;
SQL
```

### `printf %s` —— 格式字串和資料分開

```bash
printf 'password: %s\n' "$H" >> config.yml
```

這是最不容易寫錯的一種:資料走參數,永遠不會被當成格式或語法。

### 走 stdin,完全不進命令列

```bash
printf '%s' "$H" | some-tool --password-stdin
```

順帶解決另一個問題:**密碼不會出現在 `ps` 的輸出和 shell history 裡**。

## 順帶一提:遠端執行時更容易中

```bash
ssh host "sed -i 's|x|$H|' /etc/app.conf"
```

這裡有**兩層** shell:本機一層、遠端一層。`$H` 在本機展開(正確),
但展開後的字串進到遠端 shell 又會被解讀一次 —— 遠端那層的單引號救得了它,
可是只要有任何一層用了雙引號就會壞。

我後來一律改成:腳本本體當 `ssh` 的參數,**密碼類的東西全部走 stdin**。

```bash
printf '%s\n' "$H" | ssh host 'read -r H; sed -i "s|PLACEHOLDER|$H|" /etc/app.conf'
```

⚠️ 這裡有個容易踩到的變形:如果腳本本體也想從 stdin 餵(`ssh host sh -s < script.sh`),
就會和密碼搶同一條 stdin,遠端 shell 會把密碼當成腳本的第一行。
**腳本走參數,秘密走 stdin**,兩者不要混。

## 為什麼很難察覺

1. **預設沒有錯誤訊息** —— 未設定的位置參數不是錯誤(除非開了 `set -u`)
2. **雜湊很長,肉眼掃過去像是對的** —— 少的是開頭那七個字元
3. **驗證式壞在同一個地方,所以會回報成功**
4. 服務通常不會說「你的雜湊格式不對」,只會說登入失敗

第 3 點是唯一真正致命的。前兩點只會浪費時間,第 3 點會讓你**以為事情做完了** ——
然後把注意力移到別的地方。
