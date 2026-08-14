---
title: Vim 快捷指令與常用設定
date: '2026-03-29'
description: Vim 操作速查表與 .vimrc 設定參考
slug: vim
tags:
- Vim
- 快捷鍵
- vimrc
- 編輯器
toc: true
# 明確宣告。Hugo 缺這個欄位時視同已發布，會跳過 staging 檢視。
draft: false
---

## 模式切換

| 按鍵 | 說明 |
|:-----|:-----|
| `i` | 在游標前插入 |
| `I` | 在行首插入 |
| `a` | 在游標後插入 |
| `A` | 在行尾插入 |
| `o` | 在下方新增一行並插入 |
| `O` | 在上方新增一行並插入 |
| `Esc` | 回到 Normal 模式 |
| `v` | 進入 Visual 模式（字元選取） |
| `V` | 進入 Visual Line 模式（整行選取） |
| `Ctrl + v` | 進入 Visual Block 模式（區塊選取） |
| `:` | 進入 Command 模式 |
| `R` | 進入取代模式（持續覆蓋） |

---

## 移動（Normal 模式）

### 基本移動

| 按鍵 | 說明 |
|:-----|:-----|
| `h / j / k / l` | 左 / 下 / 上 / 右 |
| `w` | 跳到下一個字的開頭 |
| `b` | 跳到上一個字的開頭 |
| `e` | 跳到目前字的結尾 |
| `W / B / E` | 同上，但以空白為分隔（忽略標點） |

### 行內移動

| 按鍵 | 說明 |
|:-----|:-----|
| `0` | 跳到行首 |
| `^` | 跳到行首第一個非空白字元 |
| `$` | 跳到行尾 |
| `f{char}` | 跳到本行下一個 {char} |
| `F{char}` | 跳到本行上一個 {char} |
| `t{char}` | 跳到 {char} 前一格 |
| `;` / `,` | 重複 / 反向重複上次 f/F/t/T |

### 跨行移動

| 按鍵 | 說明 |
|:-----|:-----|
| `gg` | 跳到檔案開頭 |
| `G` | 跳到檔案結尾 |
| `{n}G` 或 `:{n}` | 跳到第 n 行 |
| `Ctrl + d` | 向下半頁 |
| `Ctrl + u` | 向上半頁 |
| `Ctrl + f` | 向下一整頁 |
| `Ctrl + b` | 向上一整頁 |
| `{` / `}` | 跳到上一個 / 下一個空行（段落） |
| `%` | 跳到對應的括號 `() {} []` |
| `H / M / L` | 跳到畫面 頂部 / 中間 / 底部 |

---

## 編輯（Normal 模式）

### 刪除

| 按鍵 | 說明 |
|:-----|:-----|
| `x` | 刪除游標下的字元 |
| `dd` | 刪除整行 |
| `D` | 刪除到行尾 |
| `dw` | 刪除到下一個字開頭 |
| `d$` | 刪除到行尾（同 `D`） |
| `d0` | 刪除到行首 |
| `dgg` | 刪除到檔案開頭 |
| `dG` | 刪除到檔案結尾 |

### 修改（刪除並進入 Insert）

| 按鍵 | 說明 |
|:-----|:-----|
| `cc` | 修改整行 |
| `C` | 修改到行尾 |
| `cw` | 修改到字尾 |
| `ci"` | 修改雙引號內的內容 |
| `ci(` | 修改括號內的內容 |
| `ci{` | 修改大括號內的內容 |
| `s` | 刪除一個字元並進入 Insert |

### 複製與貼上

| 按鍵 | 說明 |
|:-----|:-----|
| `yy` | 複製整行 |
| `yw` | 複製一個字 |
| `y$` | 複製到行尾 |
| `p` | 貼在游標後 |
| `P` | 貼在游標前 |
| `"0p` | 貼上最近一次 yank（不受 delete 影響） |
| `"+y` | 複製到系統剪貼簿 |
| `"+p` | 從系統剪貼簿貼上 |

### 其他編輯

| 按鍵 | 說明 |
|:-----|:-----|
| `u` | 復原 (undo) |
| `Ctrl + r` | 重做 (redo) |
| `.` | 重複上一次操作 |
| `>>` / `<<` | 增加 / 減少縮排 |
| `J` | 將下一行接到本行結尾 |
| `~` | 切換大小寫 |
| `r{char}` | 取代游標下的字元為 {char} |

---

## 文字物件（Text Objects）

搭配 `d`（刪除）、`c`（修改）、`y`（複製）、`v`（選取）使用：

| 按鍵 | 說明 |
|:-----|:-----|
| `iw` / `aw` | 內部字 / 含周圍空白的字 |
| `i"` / `a"` | 雙引號內 / 含引號 |
| `i'` / `a'` | 單引號內 / 含引號 |
| `i(` / `a(` | 小括號內 / 含括號 |
| `i{` / `a{` | 大括號內 / 含括號 |
| `i[` / `a[` | 中括號內 / 含括號 |
| `it` / `at` | HTML tag 內 / 含 tag |
| `ip` / `ap` | 段落內 / 含周圍空行 |

範例：`ci"` = 修改引號內容、`dap` = 刪除整個段落、`yi{` = 複製大括號內容

---

## 搜尋與取代

| 按鍵/指令 | 說明 |
|:----------|:-----|
| `/keyword` | 向下搜尋 |
| `?keyword` | 向上搜尋 |
| `n` / `N` | 下一個 / 上一個搜尋結果 |
| `*` | 搜尋游標下的字（向下） |
| `#` | 搜尋游標下的字（向上） |
| `:%s/old/new/g` | 全檔取代 |
| `:%s/old/new/gc` | 全檔取代（逐一確認） |
| `:s/old/new/g` | 只取代目前行 |
| `:10,20s/old/new/g` | 取代第 10~20 行 |

---

## 多檔案與分割視窗

| 指令 | 說明 |
|:-----|:-----|
| `:e filename` | 開啟檔案 |
| `:w` | 存檔 |
| `:q` | 離開 |
| `:wq` 或 `ZZ` | 存檔並離開 |
| `:q!` | 強制離開不存檔 |
| `:sp filename` | 水平分割開啟檔案 |
| `:vsp filename` | 垂直分割開啟檔案 |
| `Ctrl+w h/j/k/l` | 切換分割視窗 |
| `Ctrl+w =` | 平均分配視窗大小 |
| `Ctrl+w _` | 最大化目前視窗（水平） |
| `Ctrl+w \|` | 最大化目前視窗（垂直） |
| `:tabnew filename` | 開新分頁 |
| `gt` / `gT` | 下一個 / 上一個分頁 |
| `:bn` / `:bp` | 下一個 / 上一個 buffer |
| `:ls` | 列出所有 buffer |

---

## 標記（Marks）

| 按鍵 | 說明 |
|:-----|:-----|
| `ma` | 在目前位置設標記 a |
| `'a` | 跳到標記 a 所在行 |
| `` `a `` | 跳到標記 a 的精確位置 |
| `''` | 跳回上次跳轉前的位置 |
| `:marks` | 列出所有標記 |

---

## 巨集（Macros）

| 按鍵 | 說明 |
|:-----|:-----|
| `qa` | 開始錄製巨集到暫存器 a |
| `q` | 停止錄製 |
| `@a` | 執行巨集 a |
| `@@` | 重複執行上一次巨集 |
| `10@a` | 執行巨集 a 10 次 |

---

## 常用 .vimrc 設定

```vim
" === 基本設定 ===
set nocompatible          " 不相容 vi 模式
set encoding=utf-8        " 編碼
set fileencoding=utf-8

" === 顯示 ===
set number                " 顯示行號
set relativenumber        " 相對行號（方便跳行）
set cursorline            " 高亮目前行
set showmatch             " 顯示配對括號
set laststatus=2          " 總是顯示狀態列
set scrolloff=5           " 游標距離頂/底至少 5 行
set wrap                  " 自動折行
syntax on                 " 語法高亮

" === 縮排 ===
set tabstop=4             " Tab 顯示寬度
set shiftwidth=4          " 自動縮排寬度
set expandtab             " Tab 轉空格
set autoindent            " 自動縮排
set smartindent           " 智慧縮排

" === 搜尋 ===
set hlsearch              " 高亮搜尋結果
set incsearch             " 即時搜尋
set ignorecase            " 忽略大小寫
set smartcase             " 有大寫時區分大小寫

" === 操作體驗 ===
set mouse=a               " 啟用滑鼠
set clipboard=unnamedplus " 與系統剪貼簿共用
set wildmenu              " 指令補全選單
set history=1000          " 指令歷史數量
set undofile              " 持久化 undo（關檔再開還能 undo）
set undodir=~/.vim/undodir

" === 按鍵映射 ===
let mapleader = " "       " Leader 鍵設為空白鍵

" 快速存檔
nnoremap <leader>w :w<CR>

" 快速離開
nnoremap <leader>q :q<CR>

" 清除搜尋高亮
nnoremap <leader>h :nohlsearch<CR>

" 分割視窗快速切換
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" Visual 模式下移動整段
vnoremap J :m '>+1<CR>gv=gv
vnoremap K :m '<-2<CR>gv=gv

" 保持搜尋結果在畫面中間
nnoremap n nzzzv
nnoremap N Nzzzv
```

### 設定檔位置

- `~/.vimrc` — 全域設定
- 套用設定：重新開 vim，或在 vim 內執行 `:source ~/.vimrc`

### 建議的 undodir 初始化

```bash
mkdir -p ~/.vim/undodir
```
