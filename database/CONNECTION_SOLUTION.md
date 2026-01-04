# PostgreSQL 连接问题解决方案

## 🔍 问题诊断

### 当前状态
- ✅ PostgreSQL 在服务器上正常运行（监听 0.0.0.0:5432）
- ✅ 本地连接成功（通过SSH）
- ❌ 外部端口23793连接失败
- ⚠️  端口23793返回HTTPS/TLS握手，不是直接的PostgreSQL协议

### 根本原因

端口23793可能是一个**Web代理或管理界面**，而不是直接的PostgreSQL端口转发。

## 🔧 解决方案

### 方案1：检查端口转发配置（推荐）

端口23793可能需要配置为**直接转发PostgreSQL协议**，而不是通过Web代理。

**需要检查：**
1. 云服务商控制面板中的端口转发配置
2. 确认转发的是PostgreSQL协议（TCP），而不是HTTP/HTTPS
3. 确认目标端口是5432，而不是其他端口

### 方案2：使用SSH隧道（临时方案）

如果无法立即修复端口转发，可以使用SSH隧道：

```bash
# 创建SSH隧道（保持运行）
ssh -p 27236 -N -L 5432:localhost:5432 glows@tw-07.access.glows.ai

# 然后使用localhost连接
DATABASE_URL="postgresql://user:password@localhost:5432/qa_generator_db"
```

**注意**：Vercel无法使用SSH隧道，这只适用于本地开发。

### 方案3：配置正确的端口转发

如果端口23793是Web管理界面，可能需要：
1. 在管理界面中配置数据库连接
2. 或联系管理员配置新的PostgreSQL端口转发（例如23794）

### 方案4：使用云数据库服务

如果端口转发无法修复，考虑：
1. 使用Vercel Postgres（如果可用）
2. 使用其他云数据库服务（如Supabase、Neon等）
3. 迁移到专门的数据库托管服务

## 📋 当前DATABASE_URL

```
postgresql://user:password@tw-07.access.glows.ai:23793/qa_generator_db?sslmode=require
```

## ✅ 已验证

- ✅ 服务器PostgreSQL配置正确
- ✅ 本地连接（通过SSH）成功
- ✅ 数据库表结构完整

## 🎯 下一步行动

1. **联系服务器管理员**：
   - 确认端口23793的实际用途
   - 如果是Web管理界面，询问如何配置数据库连接
   - 或请求配置新的PostgreSQL端口转发

2. **临时使用SSH隧道**（仅限本地开发）：
   ```bash
   ssh -p 27236 -N -L 5432:localhost:5432 glows@tw-07.access.glows.ai
   ```

3. **考虑迁移到云数据库**（如果端口转发无法修复）

