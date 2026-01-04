#!/bin/bash
# Railway 启动脚本
# 处理 PORT 环境变量

# 调试：输出环境变量
echo "PORT environment variable: $PORT"
echo "All environment variables containing PORT:"
env | grep -i port || echo "No PORT variable found"

# 获取 PORT 环境变量，如果没有则使用默认值 8080
if [ -z "$PORT" ]; then
    PORT=8080
    echo "PORT not set, using default: $PORT"
else
    echo "Using PORT from environment: $PORT"
fi

# 确保 PORT 是数字
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "ERROR: PORT is not a valid integer: $PORT"
    PORT=8080
    echo "Falling back to default PORT: $PORT"
fi

# 使用虚拟环境中的 Python（如果存在）
if [ -f "/opt/venv/bin/python" ]; then
    PYTHON="/opt/venv/bin/python"
    echo "Using virtual environment Python: $PYTHON"
else
    PYTHON="python"
    echo "Using system Python: $PYTHON"
fi

# 启动 uvicorn
echo "Starting uvicorn on port $PORT"
exec $PYTHON -m uvicorn app.main:app --host 0.0.0.0 --port $PORT

