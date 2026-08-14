---
title: 這個部落格怎麼維護
date: 2026-08-14
description: Hugo + 兩層 repo + 消毒把關的發布流程，以及為什麼要這樣設計
slug: blog-maintenance
tags:
  - Hugo
  - CI
  - 自架服務
toc: true
# 明確宣告。Hugo 缺這個欄位時視同已發布，會跳過 staging 檢視。
draft: false
---

給三個月後的自己。這個站的內容來自我的 Obsidian 筆記庫,而筆記庫裡有內網 IP、
主機名和一堆不該公開的東西 —— 所以整套流程的重點不是「怎麼發文」,
是**「怎麼確保不該出去的東西不會出去」**。

## 三層在做什麼

```
Obsidian vault ──→ 內網 staging repo ──→ 公開 GitHub repo
   寫「現況」          寫「事件」、預覽          已核可的成品
```

**vault 記現況,文章記事件。** 這是刻意的分工,也是整套設計不會 drift 的原因:

| | vault 筆記 | 部落格文章 |
|---|---|---|
| 寫什麼 | 現在長怎樣 | 當時發生什麼、為什麼那樣選 |
| 會不會被改 | 持續改寫,永遠最新 | 有日期,發完基本凍結 |
| 例 | 「SSH 是金鑰登入」 | 「2026-08 改成金鑰登入,踩到 sshd_config 開機重生」 |

所以萃取不是複製,是**轉換**。vault 之後改了,舊文章不需要跟著改。

**內網 staging 與公開站的內容完全相同**,差別只有「已核可 / 未核可」。
staging 不是「詳細版」,是「待核可版」—— 沒有兩份內容要維護。

## 日常:寫一篇文章

```bash
cd ~/…/blog
make preview          # http://localhost:1313，含草稿、熱重載
```

新文章丟進對應的 section,`draft: true` 開頭:

```yaml
---
title: 標題
date: 2026-08-14
description: 一句話說明，會出現在列表頁與搜尋結果
slug: english-slug        # 網址用，不要中文
tags: [Unraid, SSH]
draft: true
---
```

四個 section 就是四個分類,網址直接是 `/{section}/{slug}/`:

| 目錄 | 網址 | 放什麼 |
|---|---|---|
| `content/pitfalls/` | `/pitfalls/` | 症狀 → 原因 → 解法 |
| `content/decisions/` | `/decisions/` | 為什麼選 A 不選 B |
| `content/projects/` | `/projects/` | 做出來的東西,含實測數字 |
| `content/notes/` | `/notes/` | 指令與設定備忘 |

**分類進網址是為了 GA4。** 不然統計裡只看得到一堆網址,分不出哪類文章有人看。

## 發布

```bash
make check      # 消毒掃描，這關過不了就不用想後面
make sync-dry   # 預演：列出會新增/修改/刪除什麼，不寫入
make sync       # 實際同步到公開 repo（只 commit，不 push）
```

拿掉 `draft: true` 之後才會被同步出去。`make sync` 預設**只 commit 不 push**,
最後那個 `git push` 留給你自己下。

## 消毒:兩道關卡,故意重複

`tools/sanitize_check.py` 會擋下:私有 IP、內網主機名、PEM 私鑰、bcrypt 雜湊、
各家 API token、MAC 位址,以及 `tools/redaction-map.yml` 裡設定的真名與信箱。

**不設白名單。** 需要示範 IP 時一律用 RFC 5737 的文件保留位址
(`203.0.113.x`),規則就能維持「任何 `192.168.*` 一律擋」的乾脆狀態 ——
一開白名單,規則就開始腐爛。

兩道關卡:

1. **GitLab CI** —— 每次 push 都掃,失敗就不建置、不部署
2. **`sync-to-public.py`** —— 同步前**再掃一次**,對象是「實際要複製出去的那批位元組」,
   不是整個 `content/`

第 2 道刻意重複第 1 道。理由:git hook 可以 `--no-verify` 跳過,自動化流程根本不經過
本機 hook,而**發布是不可逆的** —— 進了搜尋引擎快取就撈不回來。重複掃一次的成本是幾秒鐘。

> 這套規則第一次跑就抓到了作者自己的疏忽:`hugo.toml` 的註解裡寫了內網 staging 的
> 主機名,而那個檔案是會同步到公開 repo 的。如果當初為它開一個白名單例外,
> 就等於把內網主機名公開了。

## 兩個 repo 為什麼不共用 git 歷史

**GitHub Pages 免費方案的 repo 必須是 public** —— 原始碼全世界看得到,
不只是建置出來的網頁。

所以如果兩個 repo 共用歷史,草稿、消毒前的中間版本、所有實驗過程都會一起公開。
同步腳本因此是「複製已核可的檔案 + 在公開 repo 產生獨立 commit」,不是 merge、
不是推分支。**安全邊界是物理的,不靠紀律。**

`tools/`、`.gitlab-ci.yml`、`Makefile`、`Dockerfile` 都不同步 ——
尤其 `redaction-map.yml` 依定義就含著所有真實值。

## 環境

Hugo 是**單一執行檔**,這是選它的全部理由。裝法:

```bash
V=0.165.0
f=hugo_extended_${V}_linux-amd64.tar.gz
base=https://github.com/gohugoio/hugo/releases/download/v${V}
curl -sLO "$base/$f" && curl -sLO "$base/hugo_${V}_checksums.txt"
grep " $f\$" hugo_${V}_checksums.txt | sha256sum -c -   # 一定要驗
tar xzf "$f" hugo && mv hugo ~/.local/bin/
```

版本在三個地方寫死,升級時三處都要改:`Dockerfile` 的 `HUGO_VERSION`、
`.github/workflows/deploy.yml` 的 `HUGO_VERSION`、還有你本機這一份。
**不寫死的話,某天 Hugo 出破壞性變更,網站會自己壞掉而你不知道為什麼。**

## 踩過的坑

**`_config.yml` 的 `url` 一定要和實際網域一致。** 前一代(Jekyll)這裡不一致 ——
`url` 留在 `github.io` 而 CNAME 已經換了。網站看起來完全正常,但 RSS、sitemap、
canonical 全部指向錯的網域,而且**沒有任何錯誤訊息**。這種 bug 可以躺很久。
Hugo 這邊對應的是 `hugo.toml` 的 `baseURL`。

**`languageCode` 在 Hugo v0.158 改名為 `locale`。** 舊寫法會出棄用警告但仍能動 ——
會動的東西最容易被忽略,升級時記得看警告。

**內網 staging 不載入 GA。** `head.html` 用 `hugo.IsProduction` 判斷。
不然自己預覽的流量會汙染統計,而技術部落格的流量本來就小,汙染比例會很可觀。
