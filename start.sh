#!/bin/bash
# Railway 启动脚本
# 处理 PORT 环境变量

# 获取 PORT 环境变量，如果没有则使用默认值 8080
PORT=${PORT:-8080}

# 使用虚拟环境中的 Python（如果存在）
if [ -f "/opt/venv/bin/python" ]; then
    PYTHON="/opt/venv/bin/python"
else
    PYTHON="python"
fi

# 启动 uvicorn
exec $PYTHON -m uvicorn app.main:app --host 0.0.0.0 --port $PORT

