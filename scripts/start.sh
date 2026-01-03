#!/bin/bash
# 啟動開發伺服器腳本

# 檢查虛擬環境是否啟動
if [ -z "$VIRTUAL_ENV" ]; then
    echo "正在啟動虛擬環境..."
    source venv/bin/activate
fi

# 檢查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "錯誤: .env 文件不存在"
    echo "請先複製 env.example 並填入實際配置:"
    echo "  cp env.example .env"
    exit 1
fi

# 啟動 FastAPI 開發伺服器
echo "啟動 FastAPI 開發伺服器..."
echo "訪問 http://localhost:8000"
echo "API 文檔: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

