# 数据库设置指南

## 问题：PostgreSQL 未运行

如果遇到 "Connection refused" 错误，说明 PostgreSQL 服务没有运行。

## 解决方案

### macOS (使用 Homebrew)

```bash
# 1. 检查 PostgreSQL 是否安装
brew list postgresql@15 || brew list postgresql

# 2. 启动 PostgreSQL 服务
brew services start postgresql@15
# 或
brew services start postgresql

# 3. 检查服务状态
brew services list | grep postgresql

# 4. 创建数据库
createdb qa_generator_db

# 5. 测试连接
psql qa_generator_db -c "SELECT 1;"
```

### 如果没有安装 PostgreSQL

```bash
# 安装 PostgreSQL
brew install postgresql@15

# 启动服务
brew services start postgresql@15

# 创建数据库
createdb qa_generator_db
```

### 配置 .env 文件

确保 `.env` 文件中的 `DATABASE_URL` 格式正确：

```bash
# 格式：postgresql://用户名:密码@localhost:5432/数据库名
DATABASE_URL=postgresql://你的用户名:你的密码@localhost:5432/qa_generator_db

# 如果没有设置密码，可能是：
DATABASE_URL=postgresql://你的用户名@localhost:5432/qa_generator_db
```

### 常见用户名

- macOS 默认用户名通常是你的系统用户名
- 如果没有设置密码，可以留空或使用空密码

### 测试连接

```bash
# 测试连接
psql qa_generator_db

# 如果成功，会进入 psql 提示符
# 输入 \q 退出
```

## 完成数据库设置后

1. **创建迁移文件**
```bash
alembic revision --autogenerate -m "初始数据库结构"
```

2. **执行迁移**
```bash
alembic upgrade head
```

3. **验证表结构**
```bash
psql qa_generator_db -c "\dt"
```

## 如果仍有问题

1. 检查 PostgreSQL 版本：`psql --version`
2. 检查端口是否被占用：`lsof -i :5432`
3. 查看 PostgreSQL 日志：`tail -f /usr/local/var/log/postgresql.log`

