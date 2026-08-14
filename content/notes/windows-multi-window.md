---
title: Windows 多視窗管理
date: '2026-03-29'
description: 雙螢幕 + 多 CLI 的快捷鍵與配置建議
slug: windows-multi-window
tags:
- Windows
- 快捷鍵
- 多視窗
- 虛擬桌面
- Windows Terminal
toc: true
# 明確宣告。Hugo 缺這個欄位時視同已發布，會跳過 staging 檢視。
draft: false
---

## 情境

- 雙螢幕
- 1 個主要 Code 介面（VS Code）
- 3~4 個 Claude Code（CLI，跑在 WSL 終端機）同時多工
- 1~2 個筆記頁面

---

## 核心快捷鍵

### 虛擬桌面

| 操作 | 快捷鍵 |
|:-----|:-------|
| 切換虛擬桌面 | `Win + Ctrl + ←/→` |
| 新增虛擬桌面 | `Win + Ctrl + D` |
| 關閉虛擬桌面 | `Win + Ctrl + F4` |
| 工作檢視 (Task View) | `Win + Tab` |

### 視窗管理

| 操作 | 快捷鍵 |
|:-----|:-------|
| 視窗貼齊（半螢幕/四分格） | `Win + 方向鍵` |
| 切換應用程式（跨螢幕） | `Alt + Tab` |
| 將視窗搬到另一個螢幕 | `Win + Shift + ←/→` |
| 顯示桌面 | `Win + D` |
| 開啟工作列第 N 個程式（跨螢幕） | `Win + 數字鍵` |
| 佈局選擇 (Win11) | `Win + Z` |

### Windows Terminal 窗格

| 操作 | 快捷鍵 |
|:-----|:-------|
| 自動分割窗格 | `Alt + Shift + D` |
| 水平分割 | `Alt + Shift + -` |
| 垂直分割 | `Alt + Shift + +` |
| 切換窗格 | `Alt + 方向鍵` |
| 調整窗格大小 | `Alt + Shift + 方向鍵` |

---

## 建議配置

### 主螢幕：專注開發

- VS Code 全螢幕，專心寫 Code
- `Ctrl + B` 隱藏側邊欄，最大化程式碼視野
- 筆記可用 `Ctrl + \` 垂直分割放在右側（Markdown）

### 副螢幕：Claude Code 指揮中心

- **Windows Terminal** 開一個視窗，用 `Alt+Shift+D` 分成 4 格
- 每格各跑一個 Claude Code 實例
- 筆記頁面（若為網頁）貼齊在副螢幕側邊，佔約 1/4 寬

### 進階備案：副螢幕虛擬桌面翻頁

如果 4 格太擠（字太小）：
- 副螢幕建 2 個虛擬桌面
- 桌面 1：2 個 Claude + 筆記
- 桌面 2：另外 2 個 Claude
- 用 `Win + Ctrl + ←/→` 翻頁，主螢幕 Code 不受影響

---

## Claude Code 快捷鍵

### 常用操作

| 操作 | 快捷鍵 |
|:-----|:-------|
| 取消目前輸入/生成 | `Ctrl + C` |
| 結束 Claude Code | `Ctrl + D` |
| 終止所有背景 Agent（按兩次確認） | `Ctrl + F` |
| 清除畫面（保留歷史） | `Ctrl + L` |
| 切換詳細輸出 | `Ctrl + O` |
| 顯示/隱藏任務清單 | `Ctrl + T` |
| 將任務放到背景執行 | `Ctrl + B` |
| 搜尋歷史指令 | `Ctrl + R` |
| 用外部編輯器寫 prompt | `Ctrl + G` |
| 回溯/摘要對話 | `Esc` + `Esc` |
| 切換權限模式 | `Shift + Tab` |
| 切換模型 | `Alt + P` |
| 切換延伸思考 | `Alt + T` |
| 貼上圖片 | `Alt + V`（Windows） |

### 輸入技巧

| 操作 | 方式 |
|:-----|:-----|
| 多行輸入 | `\ + Enter` 或 `Shift + Enter` |
| 快速指令選單 | 輸入 `/` |
| 直接跑 Bash | 輸入 `!` 開頭 |
| 檔案路徑自動補全 | 輸入 `@` |
| 語音輸入（需啟用） | 按住 `Space` |

### WSL 注意事項

- `Ctrl + B` 如果用 tmux 會衝突，需按兩次
- `Ctrl + Z` 會暫停程序（suspend），小心誤按
- 多行輸入建議用 `\ + Enter`，`Shift + Enter` 需看終端機是否支援

---

## 額外提示

- **PowerToys FancyZones**：可自定義格線模板，按住 Shift 拖曳視窗一鍵歸位
- **Alt+Tab 設定**：設定 > 系統 > 多工，改為「僅顯示開啟的視窗」，避免瀏覽器分頁干擾
- **VS Code 內建 Terminal**：簡單任務直接在 VS Code 下方跑，減少切換次數
