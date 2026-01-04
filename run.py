#!/usr/bin/env python3
"""
Railway 启动脚本
直接使用 Python 读取 PORT 环境变量并启动 uvicorn
"""
import os
import sys

# 获取 PORT 环境变量
port = int(os.environ.get("PORT", 8080))

# 启动 uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

