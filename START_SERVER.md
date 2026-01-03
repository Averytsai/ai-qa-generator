# 启动服务器指南

## 数据库设置完成 ✅

- PostgreSQL 已安装并启动
- 数据库 `qa_generator_db` 已创建
- 所有表结构已创建完成

## 启动服务器

### 方式1: 使用启动脚本（推荐）

```bash
# 确保PostgreSQL在PATH中
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# 启动服务器
./scripts/start.sh
```

### 方式2: 直接使用uvicorn

```bash
# 激活虚拟环境
source venv/bin/activate

# 确保PostgreSQL在PATH中
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# 启动服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 访问API

服务器启动后，访问：

- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health
- **根路径**: http://localhost:8000/

## 永久设置PostgreSQL PATH

为了避免每次都需要设置PATH，可以将以下内容添加到 `~/.zshrc`：

```bash
# PostgreSQL 15
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

然后运行：
```bash
source ~/.zshrc
```

## 测试API

### 1. 获取分类列表
```bash
curl http://localhost:8000/api/v1/categories
```

### 2. 生成问答对
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

## 常见问题

### PostgreSQL服务未运行
```bash
brew services start postgresql@15
```

### 端口8000被占用
```bash
# 使用其他端口
uvicorn app.main:app --reload --port 8001
```

