---
title: Git 版本控制
date: '2024-05-20'
description: Git 從零開始到日常操作完整筆記
slug: git
tags:
- Git
- 版本控制
- GitHub
toc: true
lastmod: '2026-03-29'
---

## 一、安裝與初始設定

### 安裝

```bash
# Ubuntu/Debian
sudo apt install git

# Mac
brew install git

# 確認版本
git --version
```

### 初次設定（全域）

第一次用 Git 一定要先設定使用者名稱和信箱，這會記錄在每次 commit 裡：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的信箱@example.com"
```

### 其他常用設定

```bash
# 設定預設分支名稱為 main
git config --global init.defaultBranch main

# 設定預設編輯器（改成你慣用的）
git config --global core.editor vim

# 中文檔名不要顯示為亂碼
git config --global core.quotepath false

# 查看所有設定
git config --list

# 查看特定設定
git config user.name
```

---

## 二、建立 / 初始化倉庫

### 情境 A：全新專案

```bash
mkdir my-project
cd my-project
git init
```

### 情境 B：現有專案（還沒有 Git）推到遠端

```bash
# 1. 進入專案目錄
cd my-project

# 2. 初始化 Git
git init

# 3. 加入所有檔案
git add .

# 4. 第一次 commit
git commit -m "初始化專案"

# 5. 在 GitHub 上建立一個新的空倉庫（不要勾 README）

# 6. 連結遠端倉庫
git remote add origin https://github.com/你的帳號/my-project.git

# 7. 推上去
git push -u origin main
```

### 情境 C：現有專案（已經有 Git）推到新的遠端

```bash
# 1. 查看目前的遠端設定
git remote -v

# 2a. 如果還沒有 remote，新增一個
git remote add origin https://github.com/你的帳號/my-project.git

# 2b. 如果要換掉現有的 remote
git remote set-url origin https://github.com/你的帳號/my-project.git

# 3. 推上去（-u 設定追蹤，之後只要 git push 就好）
git push -u origin main
```

### 情境 D：從遠端 clone 下來

```bash
# 完整 clone
git clone https://github.com/帳號/repo.git

# 只 clone 最新一次（省時間省空間）
git clone --depth 1 https://github.com/帳號/repo.git

# clone 後要變成完整版本
git fetch --unshallow
```

---

## 三、日常工作流程

### 基本三步驟：改 → 加 → 提交

```bash
# 1. 查看目前狀態（哪些檔案被修改了）
git status

# 2. 將修改加入暫存區
git add file.txt          # 加入特定檔案
git add .                 # 加入所有修改

# 3. 提交
git commit -m "說明這次改了什麼"
```

### 推送與拉取

```bash
# 推到遠端
git push

# 從遠端拉取最新代碼（fetch + merge）
git pull

# 只抓取不合併（想先看看有什麼變化）
git fetch
```

---

## 四、分支操作

| 操作 | 指令 |
|:-----|:-----|
| 查看本地分支 | `git branch` |
| 查看所有分支（含遠端） | `git branch -a` |
| 建立新分支 | `git branch feature-x` |
| 切換分支 | `git checkout feature-x` |
| 建立並切換（一步完成） | `git checkout -b feature-x` |
| 基於某次 commit 建立分支 | `git checkout -b fix-bug abc123` |
| 合併分支到目前分支 | `git merge feature-x` |
| 刪除本地分支 | `git branch -d feature-x` |
| 強制刪除未合併的分支 | `git branch -D feature-x` |
| 刪除遠端分支 | `git push origin --delete feature-x` |
| 重新命名分支 | `git branch -m old-name new-name` |

---

## 五、查看歷史與差異

| 操作 | 指令 |
|:-----|:-----|
| 查看 commit 歷史 | `git log` |
| 簡潔版歷史（一行一筆） | `git log --oneline` |
| 圖形化分支歷史 | `git log --oneline --graph --all` |
| 查看某次 commit 的內容 | `git show abc123` |
| 查看某檔案的修改歷史 | `git log -p filename` |
| 查看每一行是誰改的 | `git blame filename` |
| 比較工作區 vs 暫存區 | `git diff` |
| 比較暫存區 vs 最新 commit | `git diff --cached` |
| 比較工作區 vs 最新 commit | `git diff HEAD` |

---

## 六、復原與回退

### 還沒 commit 的修改

```bash
# 撤銷工作區的修改（回到上次 commit 的狀態）
git checkout -- filename

# 從暫存區移除（取消 add，但保留修改）
git reset HEAD filename
```

### 已經 commit 的修改

```bash
# 修改上一次的 commit 訊息
git commit --amend -m "新的訊息"

# 回退到某次 commit（保留修改在工作區）
git reset --soft abc123

# 回退到某次 commit（保留修改在暫存區之前）
git reset --mixed abc123

# 回退到某次 commit（丟棄所有修改，危險！）
git reset --hard abc123

# 恢復單個檔案到指定版本
git checkout abc123 -- filename
```

### 產生一個「反向」的 commit（安全的撤銷）

```bash
git revert abc123
```

### 找回曾經的操作記錄

```bash
# 列出 HEAD 曾經指向過的所有 commit（本機限定）
git reflog
```

---

## 七、暫存工作（stash）

手上的改到一半不想 commit，但需要切分支或 pull：

```bash
# 暫存目前的修改
git stash

# 暫存並附上說明
git stash save "做到一半的功能"

# 查看 stash 清單
git stash list

# 恢復最近一次 stash（並從清單移除）
git stash pop

# 恢復但不移除
git stash apply

# 恢復特定的 stash
git stash apply stash@{2}

# 查看某次 stash 改了什麼
git stash show -p stash@{0}

# 刪除所有 stash
git stash clear
```

---

## 八、遠端操作

| 操作 | 指令 |
|:-----|:-----|
| 查看遠端設定 | `git remote -v` |
| 新增遠端 | `git remote add origin URL` |
| 修改遠端 URL | `git remote set-url origin URL` |
| 移除遠端 | `git remote remove origin` |
| 重新命名遠端 | `git remote rename origin upstream` |
| 查看遠端分支資訊 | `git remote show origin` |

### 合併 fork 的上游更新

```bash
git remote add upstream https://github.com/原作者/repo.git
git fetch upstream
git merge upstream/main
```

---

## 九、標籤（Tag）

```bash
# 建立輕量標籤
git tag v1.0.0

# 建立附註標籤（推薦）
git tag -a v1.0.0 -m "第一個正式版本"

# 查看所有標籤
git tag

# 推送單一標籤到遠端
git push origin v1.0.0

# 推送所有標籤
git push --tags

# 刪除本地標籤
git tag -d v1.0.0

# 刪除遠端標籤
git push origin --delete tag v1.0.0
```

---

## 十、.gitignore

讓 Git 忽略不需要追蹤的檔案：

```gitignore
# 忽略所有 .log 檔
*.log

# 忽略 node_modules 目錄
node_modules/

# 忽略環境設定檔
.env

# 忽略編譯產物
_site/
dist/
build/

# 但不忽略某個特定檔案（用驚嘆號反轉）
!important.log
```

已經被追蹤的檔案要取消追蹤（但保留本地檔案）：

```bash
git rm --cached filename
```

---

## 十一、cherry-pick

把別的分支的某個 commit 搬過來：

```bash
git cherry-pick abc123
```

---

## 十二、實用技巧

### SSH 金鑰設定（免輸入密碼）

```bash
# 1. 產生金鑰
ssh-keygen -t ed25519 -C "你的信箱@example.com"

# 2. 複製公鑰內容
cat ~/.ssh/id_ed25519.pub

# 3. 到 GitHub → Settings → SSH Keys → 貼上

# 4. 測試連線
ssh -T git@github.com

# 5. 把現有 repo 的 remote 改成 SSH
git remote set-url origin git@github.com:帳號/repo.git
```

### 記住 HTTPS 密碼

```bash
# 記住 15 分鐘（預設）
git config --global credential.helper cache

# 自訂時間（1 小時）
git config credential.helper 'cache --timeout=3600'

# 永久記住
git config --global credential.helper store
```

### 好用的 alias

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"
```

設定後就能用 `git st`、`git lg` 等簡寫。
