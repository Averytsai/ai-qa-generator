# AI 問答集生成系統

## 📋 專案說明

AI問答集生成與審查系統，通過AI自動生成和審查機制，結合人工審核反饋，持續優化生成質量，為五大知識領域提供高質量的問答內容。

### 核心功能

- 🤖 **AI自動生成**：根據選擇的知識領域自動生成問答對
- ✅ **AI自動審查**：自動評估生成內容的質量和準確性
- 📝 **人工審核**：後台篩選和修改生成的問答
- 🧠 **持續學習**：基於人工反饋優化生成策略和提示詞模板
- 📚 **五大知識領域**：通用知識、技術流程、故障排除、資安法規、應用案例

## 🏗️ 專案架構

### 前端（Frontend）
- **位置**: `frontend/`
- **技術**: React 18 + TypeScript + Vite + Ant Design 5
- **構建**: `npm run build` → `frontend/dist/`

### 後端（Backend）
- **位置**: `api/`
- **技術**: TypeScript + Vercel Serverless Functions
- **部署**: Vercel自動部署

### 數據庫（Database）
- **類型**: PostgreSQL（外部服務器）
- **連接**: 通過 `api/utils/db.ts` 連接
- **環境變數**: `DATABASE_URL`（在Vercel Dashboard中設置）

## 🚀 快速開始

### 1. 安裝依賴

```bash
# 安裝前端依賴
cd frontend && npm install

# 安裝後端依賴
cd ../api && npm install
```

### 2. 環境變數配置

複製環境變數模板：
```bash
cp env.example .env
```

編輯 `.env` 文件，設置：
- `DATABASE_URL` - PostgreSQL數據庫連接字符串
- `OPENAI_API_KEY` - OpenAI API密鑰

### 3. 本地開發

```bash
# 前端開發服務器
cd frontend && npm run dev

# 後端使用 Vercel CLI（推薦）
npm i -g vercel
vercel dev
```

### 4. 部署

推送到 GitHub，Vercel 會自動部署：
```bash
git push
```

## 📁 專案結構

```
AI 資料產生助手/
├── frontend/          # 前端代碼
│   ├── src/          # React組件和頁面
│   └── dist/         # 構建產物
├── api/              # 後端API（Vercel Functions）
│   ├── *.ts         # API端點
│   └── utils/       # 工具函數（數據庫連接等）
├── vercel.json       # Vercel部署配置
├── package.json      # 根目錄package.json
└── README.md         # 本文件
```

## 🔧 API端點

- `GET /api/categories` - 獲取分類列表
- `GET /api/qa-pairs` - 獲取問答對列表
- `POST /api/qa-pairs` - 創建問答對
- `PUT /api/qa-pairs` - 更新問答對
- `DELETE /api/qa-pairs` - 刪除問答對
- `POST /api/generate` - AI生成問答對
- `POST /api/review` - AI審查問答對
- `POST /api/feedbacks` - 提交反饋
- `GET /api/history` - 獲取歷史記錄

## 📝 環境變數

### 必需
- `DATABASE_URL` - PostgreSQL數據庫連接字符串
- `OPENAI_API_KEY` - OpenAI API密鑰

### 可選
- `ANTHROPIC_API_KEY` - Anthropic API密鑰
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI端點
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API密鑰

## 🛠️ 開發工具

- **前端**: Vite + React + TypeScript
- **後端**: Vercel Serverless Functions + TypeScript
- **數據庫**: PostgreSQL
- **部署**: Vercel

## 📄 許可證

私有專案
