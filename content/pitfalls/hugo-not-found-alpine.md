---
title: "「hugo: not found」但檔案就在那裡 —— Alpine 與 glibc 執行檔"
date: 2026-08-14
description: 在 Alpine 容器裡執行 glibc 動態連結的執行檔，錯誤訊息是「not found」而不是「找不到動態連結器」。訊息會把你帶去查 PATH、查前一步有沒有成功，而那些全都是對的。
slug: hugo-not-found-alpine
tags:
  - Docker
  - Alpine
  - musl
  - glibc
toc: true
draft: false
---

寫一份多階段 Dockerfile,前一層剛把執行檔搬進 `/usr/local/bin/`,
下一層執行它就說找不到。

## 症狀

```dockerfile
FROM alpine:3.20 AS build
RUN apk add --no-cache curl tar
RUN curl -fsSLO "$URL/hugo_extended_0.165.0_linux-amd64.tar.gz" \
 && tar xzf hugo_extended_0.165.0_linux-amd64.tar.gz hugo \
 && mv hugo /usr/local/bin/hugo
RUN hugo --minify
```

建置輸出:

```
#10 6.290 + tar xzf hugo_extended_0.165.0_linux-amd64.tar.gz hugo
#10 6.637 + mv hugo /usr/local/bin/hugo
#10 DONE 6.7s                              ← 這一層明明成功了

#13 [build 7/7] RUN hugo --minify
#13 0.126 /bin/sh: hugo: not found
#13 ERROR: process "/bin/sh -c hugo --minify" did not complete successfully: exit code: 127
```

`mv` 成功了,下一層卻說 `not found`。

## 這則訊息在說謊

會直覺往這幾個方向查:

- PATH 有沒有 `/usr/local/bin`?(有)
- `mv` 真的成功了嗎?(`DONE` 了)
- 是不是 Docker 的層快取問題?(不是)
- 檔案還在嗎?加一行 `ls -l /usr/local/bin/hugo`?**在,而且有執行權限**

真正的原因是:**`hugo_extended` 是 glibc 動態連結的,而 Alpine 用 musl。**

執行一個動態連結的執行檔時,核心會去讀 ELF 標頭裡的 interpreter 路徑
(對 glibc 是 `/lib64/ld-linux-x86-64.so.2`),然後載入那個連結器。
Alpine 沒有那個檔案,所以**核心的 `execve` 回 `ENOENT`** ——
而 shell 拿到 `ENOENT` 就印「not found」。

**「找不到」指的是連結器,不是你的執行檔。** shell 沒辦法分辨這兩者。

確認方法:

```sh
/ # ls -l /usr/local/bin/hugo
-rwxr-xr-x 1 root root 98765432 Aug 12 14:26 /usr/local/bin/hugo   ← 檔案在

/ # file /usr/local/bin/hugo
ELF 64-bit LSB executable, dynamically linked,
interpreter /lib64/ld-linux-x86-64.so.2                            ← 需要這個

/ # ls -l /lib64/ld-linux-x86-64.so.2
ls: /lib64/ld-linux-x86-64.so.2: No such file or directory         ← 這個才是「not found」
```

## 解法

### 換 glibc 基底(建議)

多階段建置的話,build stage 用什麼都不影響成品大小 ——
最終映像照樣可以是 `nginx:alpine`。

```dockerfile
FROM debian:bookworm-slim AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl libstdc++6 \
 && rm -rf /var/lib/apt/lists/*
# …下載、驗 checksum、執行…

FROM nginx:1.27-alpine
COPY --from=build /src/public /usr/share/nginx/html
```

`libstdc++6` 是給 Hugo extended 的 SCSS 轉譯器用的,一般版不需要。

### 或者:選靜態連結的版本

Hugo 的**非 extended** 版是純 Go、靜態連結的,在 Alpine 上直接能跑。
不用 SCSS 的話這是最省的一條。

代價:本機和 CI 跑的變成不同版本,哪天用到 SCSS 才會發現不一致。

### 或者:裝相容層

```dockerfile
RUN apk add --no-cache gcompat libstdc++
```

能動,但是 `gcompat` 是相容層不是 glibc,遇到冷門的 libc 行為還是會出事。
除非有理由非 Alpine 不可,否則不建議。

## 怎麼一眼認出來

只要符合這兩點,幾乎就是這個問題:

1. 錯誤是 **`not found`**(不是 `Permission denied`、不是 `Exec format error`)
2. **檔案確實存在且可執行**

`Exec format error` 是架構不符(在 arm64 上跑 amd64 執行檔),那是另一回事,
而且訊息誠實得多。

## 為什麼值得記下來

因為錯誤訊息把人帶往完全錯誤的方向。我花在檢查 `PATH`、`mv` 的退出碼、
Docker 快取上的時間,遠多於真正的原因 —— 而那個原因和我改的東西一點關係也沒有。

> 訊息說「找不到 X」的時候,先確認它說的 X 是不是你以為的那個 X。
