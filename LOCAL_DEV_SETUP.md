# 本地開發環境設置

## ✅ 設置完成

已創建本地 Express 服務器，讓前端和後端都能在本地運行。

---

## 🚀 快速開始

### 1. 安裝依賴（如果還沒安裝）

```bash
npm install
```

### 2. 確認環境變數

確保根目錄的 `.env` 文件包含：
```
DATABASE_URL=postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable
```

### 3. 啟動後端服務器（終端A）

```bash
npm run dev:api
```

應該看到：
```
Local API server listening on http://localhost:8787
Database URL: Set
```

### 4. 啟動前端開發服務器（終端B）

```bash
npm run dev
```

或

```bash
cd frontend && npm run dev
```

前端會在 `http://localhost:3000` 啟動。

---

## ✅ 驗證設置

### 測試後端（不經前端）

```bash
# 測試數據庫連接
curl http://localhost:8787/api/health-db
```

期望返回：
```json
{ "ok": true, "select1": { "ok": 1 } }
```

### 測試其他API

```bash
# 測試分類API
curl http://localhost:8787/api/categories

# 測試歷史記錄API
curl "http://localhost:8787/api/history?page=1&page_size=3"

# 測試QA pairs API
curl "http://localhost:8787/api/qa-pairs?page=1&page_size=5"
```

---

## 📁 文件結構

```
AI 資料產生助手/
├── server/
│   ├── index.ts          # 本地 Express 服務器
│   └── tsconfig.json     # TypeScript配置
├── api/
│   └── utils/
│       └── db.ts         # 數據庫連接（共用）
├── frontend/
│   └── vite.config.ts    # Vite配置（已設置proxy）
└── package.json          # 已添加 dev:api 腳本
```

---

## 🔧 配置說明

### 1. 本地 Express 服務器
- **位置**: `server/index.ts`
- **端口**: 8787（可通過 `PORT` 環境變數修改）
- **數據庫連接**: 使用 `api/utils/db.ts`（共用代碼）
- **API端點**: 
  - `GET /api/health-db` - 數據庫健康檢查
  - `GET /api/categories` - 獲取分類
  - `GET /api/history` - 獲取歷史記錄
  - `GET /api/qa-pairs` - 獲取問答對列表
  - `POST /api/qa-pairs` - 創建問答對
  - `PUT /api/qa-pairs` - 更新問答對
  - `DELETE /api/qa-pairs` - 刪除問答對
  - `GET /api/feedbacks` - 獲取反饋列表
  - `POST /api/feedbacks` - 提交反饋
  - `POST /api/generate` - AI生成（需要OpenAI，暫時返回501）
  - `POST /api/review` - AI審查（需要OpenAI，暫時返回501）

### 2. Vite Proxy 配置
- **文件**: `frontend/vite.config.ts`
- **代理**: `/api/*` → `http://localhost:8787/api/*`
- **效果**: 前端調用 `/api/xxx` 會自動轉發到本地後端

### 3. 環境變數
- **文件**: `.env`（根目錄）
- **變數**: `DATABASE_URL`（已設置）

---

## 📝 注意事項

1. **兩個終端**: 需要同時運行後端和前端
2. **端口**: 
   - 後端使用 8787
   - 前端使用 3000
3. **數據庫**: 使用 `.env` 中的 `DATABASE_URL`
4. **生產環境**: Vercel 部署不受影響，仍使用 Vercel Functions
5. **AI功能**: `generate` 和 `review` API 需要 OpenAI，本地暫時返回 501，生產環境使用 Vercel Functions

---

## 🎯 開發流程

1. **啟動後端**: `npm run dev:api`（終端A）
2. **啟動前端**: `npm run dev`（終端B）
3. **訪問**: `http://localhost:3000`
4. **API調用**: 前端自動通過 proxy 調用本地後端

---

## 🔍 路徑確認

- **db.ts 路徑**: `api/utils/db.ts` ✅
- **server 導入**: `../api/utils/db.js` ✅
- **數據庫連接**: 使用相同的 `db.ts` 文件 ✅

---

設置完成！現在可以在本地完整開發和測試了。

