---
title: Linux 基礎指令
date: '2026-03-29'
description: Linux 常用指令速查表
slug: linux
tags:
- Linux
- Bash
- 指令
- 終端機
toc: true
# 明確宣告。Hugo 缺這個欄位時視同已發布，會跳過 staging 檢視。
draft: false
---

## 檔案與目錄操作

| 指令 | 說明 | 常用範例 |
|:-----|:-----|:---------|
| `ls` | 列出檔案 | `ls -la`（含隱藏檔＋詳細資訊） |
| `cd` | 切換目錄 | `cd ~`（回家目錄）、`cd -`（回上一個目錄） |
| `pwd` | 顯示目前路徑 | |
| `mkdir` | 建立目錄 | `mkdir -p a/b/c`（遞迴建立） |
| `rm` | 刪除 | `rm -r dir/`（刪目錄）、`rm -i file`（確認後刪） |
| `cp` | 複製 | `cp -r src/ dest/`（複製目錄） |
| `mv` | 移動/重新命名 | `mv old.txt new.txt` |
| `touch` | 建立空檔案 | `touch file.txt` |
| `ln` | 建立連結 | `ln -s target link`（軟連結） |

## 檔案內容查看

| 指令 | 說明 | 常用範例 |
|:-----|:-----|:---------|
| `cat` | 顯示整個檔案 | `cat file.txt` |
| `less` | 分頁瀏覽（可上下捲動） | `less file.txt`，按 `q` 離開 |
| `head` | 顯示開頭 | `head -n 20 file.txt` |
| `tail` | 顯示結尾 | `tail -f log.txt`（即時追蹤 log） |
| `wc` | 計算行數/字數 | `wc -l file.txt`（行數） |

## 搜尋與篩選

| 指令 | 說明 | 常用範例 |
|:-----|:-----|:---------|
| `grep` | 文字內容搜尋 | `grep -rn "keyword" .`（遞迴搜尋＋顯示行號） |
| `find` | 找檔案 | `find . -name "*.log"`（找所有 .log） |
| `which` | 找指令位置 | `which python` |
| `locate` | 快速找檔案（靠資料庫） | `locate file.txt` |

## 管線與重導向

| 語法 | 說明 | 範例 |
|:-----|:-----|:-----|
| `\|` | 管線，前者輸出接後者輸入 | `ls \| grep ".txt"` |
| `>` | 輸出覆寫到檔案 | `echo "hello" > file.txt` |
| `>>` | 輸出附加到檔案 | `echo "world" >> file.txt` |
| `2>&1` | 將錯誤訊息合併到標準輸出 | `cmd > log.txt 2>&1` |
| `<` | 從檔案讀取輸入 | `sort < data.txt` |

## 權限管理

| 指令 | 說明 | 常用範例 |
|:-----|:-----|:---------|
| `chmod` | 修改權限 | `chmod +x script.sh`、`chmod 755 file` |
| `chown` | 修改擁有者 | `chown user:group file` |
| `sudo` | 以 root 身份執行 | `sudo apt update` |

### 權限數字速記

- `7` = rwx（讀寫執行）
- `6` = rw-（讀寫）
- `5` = r-x（讀＋執行）
- `4` = r--（唯讀）

## 程序管理

| 指令 | 說明 | 常用範例 |
|:-----|:-----|:---------|
| `ps` | 查看程序 | `ps aux`（列出所有程序） |
| `top` / `htop` | 即時監控系統資源 | `htop`（較好用，需安裝） |
| `kill` | 終止程序 | `kill -9 PID`（強制終止） |
| `jobs` | 查看背景工作 | |
| `bg` / `fg` | 將工作切到背景/前景 | `Ctrl+Z` 暫停後用 `bg` 繼續 |
| `nohup` | 離線後繼續執行 | `nohup cmd &` |

## 磁碟與系統資訊

| 指令 | 說明 | 常用範例 |
|:-----|:-----|:---------|
| `df` | 磁碟使用量 | `df -h`（人類可讀格式） |
| `du` | 目錄大小 | `du -sh *`（當前目錄各項大小） |
| `free` | 記憶體使用量 | `free -h` |
| `uname` | 系統資訊 | `uname -a` |

## 網路相關

| 指令 | 說明 | 常用範例 |
|:-----|:-----|:---------|
| `curl` | 發送 HTTP 請求 | `curl -O url`（下載檔案） |
| `wget` | 下載檔案 | `wget url` |
| `ping` | 測試連線 | `ping -c 3 google.com` |
| `ss` / `netstat` | 查看連接埠 | `ss -tlnp`（監聽中的 port） |
| `ip` | 查看網路介面 | `ip addr` |

## 套件管理（Ubuntu/Debian）

| 指令 | 說明 |
|:-----|:-----|
| `apt update` | 更新套件清單 |
| `apt upgrade` | 升級已安裝的套件 |
| `apt install pkg` | 安裝套件 |
| `apt remove pkg` | 移除套件 |
| `apt search keyword` | 搜尋套件 |

## 壓縮與解壓

### .tar（僅打包，無壓縮）

| 操作 | 指令 |
|:-----|:-----|
| 打包 | `tar cvf archive.tar dir/` |
| 解包 | `tar xvf archive.tar` |

### .gz（套件：gzip）

| 操作 | 指令 |
|:-----|:-----|
| 壓縮單檔 | `gzip file` |
| 解壓單檔 | `gunzip file.gz` 或 `gzip -d file.gz` |
| 壓縮目錄為 .tar.gz | `tar zcvf archive.tar.gz dir/` |
| 解壓 .tar.gz | `tar zxvf archive.tar.gz` |

### .bz2（套件：bzip2）

| 操作 | 指令 |
|:-----|:-----|
| 壓縮單檔 | `bzip2 -z file` |
| 解壓單檔 | `bzip2 -d file.bz2` 或 `bunzip2 file.bz2` |
| 壓縮目錄為 .tar.bz2 | `tar jcvf archive.tar.bz2 dir/` |
| 解壓 .tar.bz2 | `tar jxvf archive.tar.bz2` |
| 並行壓縮（lbzip2） | `tar -I lbzip2 -cvf archive.tar.bz2 dir/` |

### .xz（套件：xz-utils）

| 操作 | 指令 |
|:-----|:-----|
| 壓縮單檔 | `xz -z file` |
| 解壓單檔 | `xz -d file.xz` |
| 壓縮目錄為 .tar.xz | `tar Jcvf archive.tar.xz dir/` |
| 解壓 .tar.xz | `tar Jxvf archive.tar.xz` |

### .zip（套件：zip / unzip）

| 操作 | 指令 |
|:-----|:-----|
| 壓縮 | `zip -r archive.zip dir/` |
| 解壓 | `unzip archive.zip` |

### .rar（套件：rar / unrar）

| 操作 | 指令 |
|:-----|:-----|
| 壓縮 | `rar a archive.rar dir/` |
| 解壓 | `unrar e archive.rar` |
| 解壓到指定目錄 | `rar x archive.rar dir/` |

### .7z（套件：p7zip-full）

| 操作 | 指令 |
|:-----|:-----|
| 壓縮 | `7z a archive.7z file` |
| 加密壓縮 | `7z a archive.7z file -pPASSWORD` |
| 解壓 | `7z x archive.7z` |

### .zst（套件：zstd）

| 操作 | 指令 |
|:-----|:-----|
| 壓縮單檔 | `zstd file` |
| 解壓單檔 | `zstd -d file.zst` |
| 壓縮目錄為 .tar.zst | `tar -I zstd -cvf archive.tar.zst dir/` |
| 解壓 .tar.zst | `tar -I zstd -xvf archive.tar.zst` |

### tar 參數速記

| 參數 | 說明 |
|:-----|:-----|
| `c` | 建立壓縮檔（create） |
| `x` | 解壓（extract） |
| `v` | 顯示過程（verbose） |
| `f` | 指定檔名（file） |
| `z` | 使用 gzip |
| `j` | 使用 bzip2 |
| `J` | 使用 xz |
| `-I` | 指定外部壓縮程式（如 lbzip2、zstd） |

## 實用組合技

```bash
# 找出佔最多空間的前 10 個目錄
du -sh * | sort -rh | head -10

# 找出包含特定文字的所有檔案並列出行號
grep -rn "TODO" .

# 即時監看 log 並篩選關鍵字
tail -f app.log | grep "ERROR"

# 批次重新命名（把 .txt 改成 .md）
for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# 計算目前目錄下有幾個檔案
find . -type f | wc -l
```
