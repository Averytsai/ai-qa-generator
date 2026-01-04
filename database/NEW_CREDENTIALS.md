# 新的数据库凭据配置

## ✅ 已验证

- ✅ **本地连接成功**：postgres用户和密码1234正确
- ✅ **数据库存在**：qa_generator_db数据库存在
- ✅ **PostgreSQL配置正确**：listen_addresses = '*'
- ✅ **pg_hba.conf配置正确**：允许外部连接

## ⚠️ 当前状态

- ❌ **外部端口5432不可访问**：连接超时
- ❌ **端口23793仍然失败**：Connection terminated unexpectedly

## 📋 新的数据库凭据

```
Host: tw-07.access.glows.ai（或服务器公网IP）
Port: 5432（需要配置端口转发）
Database: qa_generator_db（或postgres）
Username: postgres
Password: 1234
```

## 🔧 需要完成的配置

### 步骤1：配置端口转发（如果还未配置）

需要在云服务商控制面板配置端口转发：

**选项A：直接开放5432端口**
```
外部端口: 5432
协议: TCP
内部IP: 192.168.122.204
内部端口: 5432
转发类型: DNAT（直接转发）
```

**选项B：使用新端口转发到5432**
```
外部端口: 5433（或其他可用端口）
协议: TCP
内部IP: 192.168.122.204
内部端口: 5432
转发类型: DNAT（直接转发）
```

### 步骤2：更新DATABASE_URL

配置端口转发后，更新DATABASE_URL：

**如果直接开放5432端口：**
```
postgresql://postgres:1234@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require
```

**如果使用新端口（例如5433）：**
```
postgresql://postgres:1234@tw-07.access.glows.ai:5433/qa_generator_db?sslmode=require
```

### 步骤3：测试连接

配置完成后，测试连接：
```bash
cd database
DATABASE_URL="postgresql://postgres:1234@tw-07.access.glows.ai:[端口]/qa_generator_db?sslmode=require" node test_direct_connection.js
```

## 🧪 临时测试方案（SSH隧道）

如果端口转发还未配置，可以使用SSH隧道测试：

```bash
# 终端1：创建SSH隧道
ssh -p 27236 -N -L 5432:localhost:5432 glows@tw-07.access.glows.ai

# 终端2：测试连接
cd database
DATABASE_URL="postgresql://postgres:1234@localhost:5432/qa_generator_db" node test_direct_connection.js
```

## 📝 Vercel环境变量配置

配置端口转发后，在Vercel Dashboard设置：

```
DATABASE_URL=postgresql://postgres:1234@tw-07.access.glows.ai:[端口]/qa_generator_db?sslmode=require
OPENAI_API_KEY=sk-...
```

## ✅ 检查清单

- [ ] 配置端口转发（5432或新端口）
- [ ] 测试外部连接
- [ ] 更新DATABASE_URL
- [ ] 在Vercel设置环境变量
- [ ] 重新部署Vercel应用
- [ ] 测试所有功能

