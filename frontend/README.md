# AI問答集生成系統 - 前端

## 技術棧

- React 18
- TypeScript
- Vite
- Ant Design 5
- React Router
- Axios

## 快速開始

### 1. 安裝依賴

```bash
cd frontend
npm install
```

### 2. 啟動開發服務器

```bash
npm run dev
```

前端將在 http://localhost:3000 啟動

### 3. 確保後端服務器運行

前端需要後端API運行在 http://localhost:8000

## 功能頁面

1. **生成問答** (`/generate`) - 生成新的問答對
2. **審查管理** (`/review`) - 審查問答對質量
3. **審核反饋** (`/feedback`) - 人工審核和反饋
4. **知識庫** (`/knowledge`) - 查看已通過的問答對
5. **統計分析** (`/analytics`) - 查看統計數據

## API配置

API基礎URL在 `src/services/api.ts` 中配置：

```typescript
const API_BASE_URL = '/api/v1';
```

開發環境下，Vite會自動代理 `/api` 請求到 `http://localhost:8000`

## 構建生產版本

```bash
npm run build
```

構建產物在 `dist/` 目錄

