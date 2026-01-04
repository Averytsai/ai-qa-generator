# 使用 Python 3.11 作为基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 复制 requirements 文件
COPY requirements.txt .

# 安装依赖
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# 复制应用代码
COPY . .

# 启动命令（Railway 会自动设置 PORT 环境变量）
# 使用 shell 格式确保环境变量正确解析
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}

