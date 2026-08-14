---
title: Cloudflare 幫我遮住了一個 bug —— 整站用 http 建置卻看不出來
date: 2026-08-14
description: 站台用 http:// 的 baseURL 建置出去，但 canonical 和 og:url 都顯示 https。因為 Cloudflare 的 Automatic HTTPS Rewrites 會修 HTML 裡的連結 —— 而 sitemap.xml 與 robots.txt 不是 HTML。
slug: cloudflare-masked-http-baseurl
tags:
  - Cloudflare
  - Hugo
  - SEO
  - GitHub Pages
toc: true
draft: false
---

新站上線,開瀏覽器看:網址列是 https、綠鎖、`canonical` 也是 https。
一切正常。

直到我去看 `robots.txt`。

## 症狀

```
$ curl -s https://example.com/robots.txt | grep Sitemap
Sitemap: http://example.com/sitemap.xml          ← http

$ curl -s https://example.com/sitemap.xml | grep -o '<loc>[^<]*' | head -1
<loc>http://example.com/                          ← http
```

但同一個站的 HTML:

```
$ curl -s https://example.com/ | grep -o 'rel=canonical[^>]*'
rel=canonical href="https://example.com/"         ← https
```

**同一次建置,HTML 是 https,XML 和純文字是 http。**

## 原因有兩層

### 第一層:建置時的 baseURL 真的是 http

用 GitHub Actions 部署 Pages 時,官方範本是這樣寫的:

```yaml
- uses: actions/configure-pages@v5
  id: pages
- run: hugo --baseURL "${{ steps.pages.outputs.base_url }}/"
```

問題在於:**自訂網域的憑證還在發放期間,`configure-pages` 回傳的
`base_url` 是 `http://`,不是 `https://`。**

整站就用 http 建出去了 —— 每一個絕對網址都是。

### 第二層:Cloudflare 把證據蓋掉了

站台掛在 Cloudflare 後面(橘雲),而 Cloudflare 有一個預設開啟的功能叫
**Automatic HTTPS Rewrites**:它會掃過回應內容,把 `http://` 的連結改寫成 `https://`。

但它**只處理 HTML**。`sitemap.xml`、`robots.txt`、`feed.xml` 不是 HTML,
原樣送出。

於是:

| 檔案 | 建置產出 | 使用者看到 |
|---|---|---|
| `index.html` | `http://` | **`https://`**(Cloudflare 改的) |
| `sitemap.xml` | `http://` | `http://` |
| `robots.txt` | `http://` | `http://` |

**你在瀏覽器裡怎麼看都是對的,而搜尋引擎拿到的是錯的。**

## 影響

- 搜尋引擎可能把 http 和 https 當成兩個站,稀釋權重
- sitemap 裡的網址和實際 canonical 不一致
- 哪天把 Cloudflare 拿掉(或關掉那個功能),整站的內部絕對連結會一起現形

## 解法

### 不要信任 `base_url`,直接寫死

網域已經確定的話,`baseURL` 本來就該寫在設定檔裡:

```toml
# hugo.toml
baseURL = "https://example.com/"
```

```yaml
# workflow：不要覆蓋 baseURL
- run: hugo --minify --cleanDestinationDir
```

### 加一個直接檢查產出的步驟

這是重點 —— **因為線上看不出來,所以只能驗產出檔案本身**。

```yaml
- name: 確認產出的絕對網址是 https
  run: |
    if grep -q "http://example\." public/sitemap.xml public/robots.txt 2>/dev/null; then
      echo "::error::產出含 http:// 絕對網址，檢查 baseURL"
      grep -n "http://example\." public/sitemap.xml public/robots.txt || true
      exit 1
    fi
```

十秒鐘的檢查,擋掉一個肉眼永遠看不到的問題。

## 一般化的教訓

**CDN 會修好你的錯誤,然後你就不知道自己錯了。**

Automatic HTTPS Rewrites 立意良善 —— 它防的是混合內容警告。
但「自動修好」和「隱藏問題」是同一件事的兩面。

同類的還有:自動 minify、自動壓縮圖片、自動加安全標頭、Email Obfuscation。
每一個都可能讓「產出是壞的」變成「看起來是好的」。

> **驗證要驗產出的檔案,不要驗瀏覽器看到的畫面。**
> 中間隔了 CDN 的時候,那是兩個不同的東西。

順帶一提,`robots.txt` 也可能**不是你寫的那份** ——
Cloudflare 會在前面插入自己的一段(AI 爬蟲的 `Disallow` 清單和 Content-Signal)。
第一次看到會以為是自己的模板壞了。

## 補充:快取

修好推上去之後,`robots.txt` 還是舊的。

```
$ curl -sI https://example.com/robots.txt | grep -i cf-cache
cf-cache-status: HIT
age: 256
cache-control: max-age=14400
```

Cloudflare 快取著。加個查詢參數就能繞過確認新版本已經部署:

```bash
curl -s "https://example.com/robots.txt?cb=$RANDOM" | grep Sitemap
```

要立刻生效就去 Cloudflare 手動 purge,否則等 TTL 過期。
