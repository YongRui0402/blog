---
title: CI 通過純屬運氣 —— 兩個 runner 共用同一個標籤
date: 2026-08-14
description: 同一份 .gitlab-ci.yml，前一次 pipeline 綠、下一次紅。原因是 build 和 deploy 被排到不同的 runner，而映像只存在於建置它的那一台。
slug: ci-runner-tag-collision
tags:
  - GitLab CI
  - Docker
  - CI
toc: true
draft: false
hook: "同一份設定，前一次 pipeline 全綠，下一次 deploy 炸掉。而綠的那次才是意外。"
takeaway: "間歇性失敗的 CI，先問「這兩個 job 跑在同一台機器上嗎」。"
key_points:
  - "兩個 runner 都帶 `docker` 標籤時，GitLab 會各自派工，build 和 deploy 可能落在不同台"
  - "`docker build` 的映像只存在建置它那台的本機 daemon，跨 runner 不共享"
  - "錯誤訊息是 `pull access denied`，會把人帶去查 registry 認證 —— 但根本沒有人要 pull"
  - "標籤要挑「能唯一指到一台」的組合，`docker` 這種能力標籤不能單獨用來選機器"
---

同一份 `.gitlab-ci.yml`,只改了幾行文字。前一次 pipeline 全綠,下一次 deploy 炸掉。

而**綠的那一次才是意外**。

## 症狀

```
$ docker stop  "blog_staging" || true
Error response from daemon: No such container: blog_staging

$ docker rm    "blog_staging" || true
Error response from daemon: No such container: blog_staging

$ docker run -d --name blog_staging ... blog_staging:latest
Unable to find image 'blog_staging:latest' locally
docker: Error response from daemon: pull access denied for blog_staging,
repository does not exist or may require 'docker login': denied
```

三件事同時發生:

- 前一個 stage 的 `build-image` **成功了**
- 但 deploy 說**映像不存在**
- 而且說**容器也不存在** —— 可是那個容器此刻正在對外服務

最後一點是關鍵線索。容器活著,這個 job 卻看不到它 ——
**那它連的不是同一個 docker daemon。**

## 原因

有兩台 runner:

```
arm-runner   tags: docker, arm64, <平台名>
x86-runner   tags: docker, x86,   <平台名>
```

而我的 CI 寫的是:

```yaml
build-image:
  tags: [docker]      # ← 兩台都符合
deploy-staging:
  tags: [docker]      # ← 兩台都符合
```

`docker` 這個標籤**兩台都有**。GitLab 會把 job 派給任何一台符合的 runner,
每個 job 各派各的。

於是:

| pipeline | build 落在 | deploy 落在 | 結果 |
|---|---|---|---|
| 前一次 | x86 | x86 | ✅ 剛好同一台 |
| 這一次 | x86 | **arm** | ❌ arm 上沒有那個映像 |

`docker build` 產出的映像只存在於**執行建置的那一台的本機 daemon**。
跨 runner 不會共享,除非推到 registry。

**前一次會過是運氣。** 設定從頭到尾都是錯的,只是抽籤抽對了。

## 怎麼確認

GitLab 的 job API 會告訴你每個 job 實際落在哪:

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" \
  "$GITLAB/api/v4/projects/$ID/pipelines/$PIPELINE/jobs" \
  | jq -r '.[] | "\(.name)\t\(.status)\trunner=\(.runner.description)"'
```

```
deploy-staging   failed    runner=arm-runner
build-image      success   runner=x86-runner      ← 不同台
sanitize         success   runner=arm-runner
```

順便看一下每台 runner 的標籤:

```bash
curl -s -H "PRIVATE-TOKEN: $TOKEN" "$GITLAB/api/v4/runners/5" \
  | jq '{description, tag_list, architecture}'
```

## 解法

### 用一個真正唯一的標籤

```yaml
default:
  tags: [docker, x86]     # 只有一台同時具備這兩個
```

用 `default:` 一次套用到所有 job,比每個 job 各寫一次不容易漏。

挑標籤的原則:**這組標籤要能唯一指到一台**。`docker` 這種
「大家都會裝」的能力標籤不適合單獨用來選機器。

### 或者:讓映像不依賴本機

推到 registry,deploy 再拉下來:

```yaml
build-image:
  script:
    - docker build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA" .
    - docker push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
deploy:
  script:
    - docker pull "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
```

比較穩健(runner 掛掉換一台也不影響),代價是每次都要推拉一份映像。
單機部署的小專案,釘標籤就夠了。

## 為什麼容易漏

1. **它會間歇性地成功。** 兩台 runner 就有一半機率抽對,
   而「有時候會過」比「每次都失敗」難查很多
2. **錯誤訊息指向錯的方向。** `pull access denied` 讓人去查 registry 認證,
   但根本沒有人要 pull —— 那只是 docker 在本機找不到之後的預設行為
3. **前一次是綠的。** 直覺會去看「我這次改了什麼」,而答案是「跟你改的無關」

> 間歇性失敗的 CI,先問「兩次跑在同一台機器上嗎」。

## 順帶一提

發現之後我去看了其他專案,**同一個隱患還在別的 repo 裡** ——
一樣是 `tags: [docker]` 先 build 再 deploy,目前能動只是因為還沒抽到壞籤。

一個地方踩到的坑,值得去 grep 一下所有同型的設定。
