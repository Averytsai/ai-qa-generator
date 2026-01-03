# AI 問答集生成系統

## 專案說明

AI問答集生成與審查系統，通過AI自動生成和審查機制，結合人工審核反饋，持續優化生成質量，為五大知識領域提供高質量的問答內容。

### 核心功能

- 🤖 **AI自動生成**：根據選擇的知識領域自動生成問答對
- ✅ **AI自動審查**：自動評估生成內容的質量和準確性
- 📝 **人工審核**：後台篩選和修改生成的問答
- 🧠 **持續學習**：基於人工反饋優化生成策略和提示詞模板
- 📚 **五大知識領域**：通用知識、技術流程、故障排除、資安法規、應用案例

## 專案結構

```
AI資料產生助手/
├── app/                      # 應用程式主目錄
│   ├── api/                  # API路由
│   ├── core/                 # 核心業務邏輯
│   ├── models/               # 資料庫模型
│   ├── schemas/              # Pydantic模型
│   ├── services/             # 服務層
│   ├── utils/                # 工具函數
│   ├── config.py             # 配置管理
│   └── main.py               # FastAPI入口
├── tests/                    # 測試
├── scripts/                  # 腳本
├── requirements/             # 依賴管理
├── alembic/                  # 資料庫遷移
├── DEVELOPMENT_RULES.md      # 開發規則
├── GETTING_STARTED.md        # 開發啟動指南
├── QUICK_START.md            # 快速開始
└── README.md                 # 本文件
```

## 快速開始

### 1. 環境配置

```bash
# 創建虛擬環境
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 安裝依賴
pip install -r requirements/dev.txt

# 配置環境變數
cp env.example .env
# 編輯 .env 填入實際配置值（至少需要 DATABASE_URL 和 AI API Key）
```

### 2. 資料庫設置

```bash
# 創建資料庫
createdb qa_generator_db

# 配置 .env 中的 DATABASE_URL
# DATABASE_URL=postgresql://user:password@localhost:5432/qa_generator_db
```

### 3. 驗證環境

```bash
# 運行環境檢查腳本
python scripts/check_env.py
```

### 4. 啟動開發伺服器

```bash
# 方式1: 使用啟動腳本
./scripts/start.sh

# 方式2: 直接使用 uvicorn
uvicorn app.main:app --reload

# 訪問 API 文檔
# http://localhost:8000/docs
```

## 開發前準備

1. **閱讀開發指南**
   - 📖 [GETTING_STARTED.md](GETTING_STARTED.md) - 詳細的開發啟動指南
   - ⚡ [QUICK_START.md](QUICK_START.md) - 5分鐘快速開始
   - 📋 [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) - 開發規範

2. **規劃開發階段**
   - 在 `DEVELOPMENT_PHASES.md` 中規劃開發階段
   - 確認開發順序和任務清單

3. **開始開發**
   - 按照階段順序逐步開發
   - 每個階段完成後進行測試和驗證

## 開發流程

### 1. 規劃階段
- 定義功能需求
- 劃分開發階段
- 識別風險和依賴

### 2. 開發階段
- 一次只開發一個模組
- 完成後立即測試
- 確認無誤後再進行下一個

### 3. 整合階段
- 整合各模組
- 進行整合測試
- 優化和調整

### 4. 部署階段
- 最終測試
- 文件整理
- 部署上線

## 使用 AI 協作開發

### 推薦流程

1. **規劃階段 Prompt**
   ```
   請為 [功能名稱] 進行設計規劃
   [使用 PROMPT_RULES.md 中的模板]
   ```

2. **開發階段 Prompt**
   ```
   請開發 [模組名稱] 模組
   [使用 PROMPT_RULES.md 中的模板]
   ```

3. **審查階段 Prompt**
   ```
   請審查以下程式碼
   [使用 PROMPT_RULES.md 中的模板]
   ```

## 重要提醒

⚠️ **不要一次開發全部功能**
- 按照階段逐步開發
- 每個階段完成後確認
- 避免累積錯誤

⚠️ **遵循開發規則**
- 程式碼風格要一致
- 每個功能都要有測試
- 錯誤處理要完善

⚠️ **使用結構化 Prompt**
- 明確描述需求
- 提供驗證標準
- 分步驟進行

## 相關文件

- [開發規則](DEVELOPMENT_RULES.md)
- [Prompt 規則](PROMPT_RULES.md)
- [開發階段規劃](DEVELOPMENT_PHASES.md)

