# PostgreSQL 端口配置说明

## 🔍 端口信息

- **内部端口**: 5432 (PostgreSQL默认端口)
- **外部端口**: 23793 (端口转发映射)

## ✅ 已验证

- ✅ 通过SSH隧道连接成功（localhost:5432 → 服务器:5432）
- ✅ 数据库配置正确
- ✅ 表结构完整

## ⚠️ 端口23793连接问题

端口23793可能是一个Web代理或管理界面，而不是直接的PostgreSQL端口转发。

### 解决方案

#### 方案1：使用SSH隧道（仅限本地开发）

```bash
# 创建SSH隧道
ssh -p 27236 -L 5432:localhost:5432 glows@tw-07.access.glows.ai

# 然后使用localhost连接
DATABASE_URL="postgresql://user:password@localhost:5432/qa_generator_db"
```

#### 方案2：配置正确的端口转发

需要在服务器管理面板中配置：
- 将外部端口23793直接转发到内部5432端口
- 确保转发的是PostgreSQL协议，而不是HTTP/HTTPS

#### 方案3：使用Vercel环境变量（推荐）

在Vercel Dashboard中设置：
```
DATABASE_URL=postgresql://user:password@tw-07.access.glows.ai:23793/qa_generator_db?sslmode=require
```

如果23793端口无法直接连接，可能需要：
1. 检查端口转发配置
2. 或联系服务器管理员配置正确的端口转发

## 📝 当前DATABASE_URL格式

```
postgresql://user:password@tw-07.access.glows.ai:23793/qa_generator_db?sslmode=require
```

## 🧪 测试连接

```bash
cd database
DATABASE_URL="postgresql://user:password@tw-07.access.glows.ai:23793/qa_generator_db?sslmode=require" node test_connection.js
```

