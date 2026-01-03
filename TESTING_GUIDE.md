# 測試指南

## 快速測試

### 1. 啟動服務器

```bash
# 激活虛擬環境
source venv/bin/activate

# 啟動服務器
uvicorn app.main:app --reload

# 或使用啟動腳本
./scripts/start.sh
```

服務器啟動後，訪問：
- API文檔: http://localhost:8000/docs
- 健康檢查: http://localhost:8000/health

### 2. 初始化數據庫

```bash
# 運行初始化腳本
python scripts/init_db.py

# 或使用Alembic
alembic revision --autogenerate -m "初始數據庫結構"
alembic upgrade head
```

### 3. 測試API

#### 3.1 獲取分類列表

```bash
curl http://localhost:8000/api/v1/categories
```

#### 3.2 生成問答對

```bash
curl -X POST "http://localhost:8000/api/v1/generator/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "通用知识",
    "count": 1,
    "topic": "Python编程",
    "style": "专业"
  }'
```

#### 3.3 審查問答對

```bash
# 先獲取一個問答對ID（從生成響應中）
curl -X POST "http://localhost:8000/api/v1/reviewer/review" \
  -H "Content-Type: application/json" \
  -d '{
    "qa_pair_id": "問答對ID"
  }'
```

#### 3.4 提交反饋

```bash
curl -X POST "http://localhost:8000/api/v1/feedback/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "qa_pair_id": "問答對ID",
    "action": "approve",
    "review_reason": "答案準確完整"
  }'
```

## 使用FastAPI自動文檔測試

最簡單的方式是使用FastAPI自動生成的交互式文檔：

1. 訪問 http://localhost:8000/docs
2. 點擊任意API端點
3. 點擊 "Try it out"
4. 填入參數
5. 點擊 "Execute" 執行

## 常見問題

### 問題1: 數據庫連接失敗

**解決方案：**
- 檢查 `.env` 中的 `DATABASE_URL` 是否正確
- 確認PostgreSQL服務正在運行
- 確認數據庫已創建

### 問題2: OpenAI API調用失敗

**解決方案：**
- 檢查 `.env` 中的 `OPENAI_API_KEY` 是否正確
- 確認API Key有效且有足夠額度
- 檢查網絡連接

### 問題3: 模組導入錯誤

**解決方案：**
- 確認虛擬環境已激活
- 確認所有依賴已安裝：`pip install -r requirements/dev.txt`
- 確認在項目根目錄運行

## 測試檢查清單

- [ ] 服務器可以正常啟動
- [ ] 數據庫連接成功
- [ ] 可以訪問API文檔頁面
- [ ] 可以獲取分類列表
- [ ] 可以生成問答對
- [ ] 可以審查問答對
- [ ] 可以提交反饋

