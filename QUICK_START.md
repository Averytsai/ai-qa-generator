# 快速開始指南

## 🚀 5分鐘快速啟動

### 步驟1: 環境準備

```bash
# 1. 創建虛擬環境
python3 -m venv venv

# 2. 啟動虛擬環境
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 3. 安裝依賴
pip install -r requirements/dev.txt
```

### 步驟2: 環境變數配置

```bash
# 1. 複製環境變數範例文件
cp env.example .env

# 2. 編輯 .env 文件，填入實際的配置值
# 至少需要配置：
# - DATABASE_URL
# - OPENAI_API_KEY (或其他AI模型API Key)
```

### 步驟3: 資料庫設置

```bash
# 1. 確保 PostgreSQL 已安裝並運行
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# 2. 創建資料庫
createdb qa_generator_db

# 3. 測試連線
psql qa_generator_db
```

### 步驟4: 驗證環境

```bash
# 運行環境檢查腳本（如果有的話）
python -c "from app.config import Settings; print('配置載入成功')"
```

## 📝 下一步

完成環境配置後，請閱讀 [GETTING_STARTED.md](GETTING_STARTED.md) 了解詳細的開發流程。

## ⚠️ 常見問題

### 問題1: pip install 失敗
**解決方案：** 確保使用 Python 3.10+，並已啟動虛擬環境

### 問題2: 無法連接資料庫
**解決方案：** 
- 檢查 PostgreSQL 是否運行：`brew services list` (macOS)
- 檢查 DATABASE_URL 格式是否正確
- 確認資料庫用戶權限

### 問題3: API Key 錯誤
**解決方案：**
- 確認 .env 文件中的 API Key 格式正確
- 確認 API Key 有效且有足夠額度

