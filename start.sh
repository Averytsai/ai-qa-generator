#!/bin/bash
# Railway 启动脚本
# 处理 PORT 环境变量

# 获取 PORT 环境变量，如果没有则使用默认值 8080
PORT=${PORT:-8080}

# 启动 uvicorn
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT

