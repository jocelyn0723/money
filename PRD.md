# 📝 產品需求文件 (PRD) - 智慧文字自動記帳程式

## 1. 專案概述 (Project Overview)
本專案旨在開發一個**極簡、智慧的自動記帳網頁應用**。使用者只需輸入包含「消費描述」與「金額」的任意文字，系統便能自動解析內容、擷取關鍵資訊，並將帳目儲存至資料庫中。

### 🛠 技術棧 (Tech Stack)
* **前端與 API 部署**：Vercel (Next.js / React / Vanilla JS)
* **資料庫與後端服務**：Supabase (PostgreSQL / Auth)
* **程式碼管理**：GitHub

---

## 2. 核心功能需求 (Core Features)

### 📌 功能 A：智慧文字解析記帳 (Text-to-Expense Parsing)
* **需求描述**：使用者在輸入框輸入一段話（例如：「中午吃拉麵 250 元」或「買一件衣服 1200」），系統能自動拆解出「項目（拉麵）」與「金額（250）」。
* **實作規則 (Regex 範例)**：
  * 匹配字串中的數字作為 `amount`。
  * 移除數字及常見貨幣單位（如：元、$、NTD）後的剩餘文字作為 `description`。
* **使用者互動**：點擊送出或按下 Enter 後，即時觸發解析並寫入資料庫。

### 📌 功能 B：帳目即時列表與統計 (Dashboard & History)
* **需求描述**：
  * 顯示歷史記帳明細列表（依時間倒序排列）。
  * 提供當日/當月的總消費金額加總統計。
  * 提供一鍵刪除或修改單筆帳目的功能。

### 📌 功能 C：使用者驗證 (User Authentication)
* **需求描述**：為了保障個人財務隱私，使用者需登入後才能看到與管理自己的帳本。
* **實作建議**：直接啟用 **Supabase Auth**（支援 Email 登入或 Google 第三方登入）。

---

## 3. 資料庫架構設計 (Database Schema)

在 Supabase 中建立一張名為 `expenses` 的資料表：

| 欄位名稱 (Column) | 資料型態 (Type) | 說明 (Description) |
| :--- | :--- | :--- |
| `id` | UUID (Primary Key) | 帳目唯一識別碼，預設 `gen_random_uuid()` |
| `user_id` | UUID (Foreign Key) | 關聯至 `auth.users.id`，確保資料隱私 |
| `description` | TEXT | 消費項目/文字描述 (例如：吃拉麵) |
| `amount` | NUMERIC / INT | 消費金額 (例如：250) |
| `category` | VARCHAR | 消費分類 (預設：未分類，供未來擴充) |
| `created_at` | TIMESTAMPTZ | 記帳時間，預設 `NOW()` |

> ⚠️ **安全性提醒 (RLS)**：必須在 Supabase 開啟 **Row Level Security (RLS)**，並設定 Policy 為 `auth.uid() = user_id`，確保使用者只能讀寫自己的資料。

---

## 4. 使用者流程與 UI 介面設計 (User Flow & UI)

### 🏃‍♂️ 使用者旅程
1. 進入網站 ➡️ 2. 透過 Supabase 登入 ➡️ 3. 進入記帳主頁 ➡️ 4. 輸入「文字+金額」並送出 ➡️ 5. 頁面即時更新明細與總金額。

### 🎨 介面區塊建議
* **頂部 (Header)**：應用程式名稱、目前登入的使用者帳號、登出按鈕。
* **核心輸入區 (Input Box)**：一個醒目的單行輸入框與「送出」按鈕。
  * *範例提示字：試試輸入「晚餐吃火鍋 800」*
* **統計看板 (Metrics)**：本月總花費：`$ X,XXX` 元。
* **歷史明細 (History List)**：清單顯示時間、項目、金額，右側附帶刪除圖示（🗑️）。

---

## 5. 開發與部署計畫 (Deployment & DevOps)

* **GitHub 工作流**：主要分支為 `main`。開發新功能時拉取 `feature/` 分支，透過 Pull Request (PR) 進行代碼審查與合併。
* **Vercel 部署**：
  * 連結 GitHub 儲存庫，設定自動部署 (CI/CD)。
  * 在 Vercel 後台設定 **Environment Variables (環境變數)**：
    * `NEXT_PUBLIC_SUPABASE_URL`
    * `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 6. 未來擴充潛力 (Future Roadmap)
* [ ] **AI 自動分類**：根據文字自動判斷是「餐飲」、「娛樂」還是「交通」。
* [ ] **圖表分析**：增加圓餅圖或折線圖，視覺化當月花費比例。
* [ ] **Line Bot 整合**：未來可透過 Line 聊天機器人將文字傳入此系統，連網頁都不用打開。
