# 数据库连接测试报告

## ✅ 测试结果

### 1. PostgreSQL 服务状态
- **状态**: ✅ 运行正常
- **版本**: PostgreSQL 12.22
- **监听地址**: localhost:5432

### 2. 数据库连接测试
- **本地连接**: ✅ 成功（通过SSH）
- **外部连接**: ❌ 超时（从本地机器直接连接）

### 3. 数据库结构
- **数据库名**: `qa_generator_db`
- **表**: 
  - ✅ `qa_pairs` (存在)
  - ✅ `feedbacks` (存在)
- **数据**: 当前有 0 条记录

## ⚠️ 问题分析

### 问题：Vercel 无法连接数据库

**原因**：
1. PostgreSQL 只监听 `localhost`（127.0.0.1），不接受外部连接
2. 防火墙可能阻止了 5432 端口的访问
3. `postgresql.conf` 中的 `listen_addresses` 可能只设置为 `localhost`

### 解决方案

#### 方案1：配置 PostgreSQL 接受外部连接（推荐）

**步骤1：修改 PostgreSQL 配置**

```bash
# SSH 连接到服务器
ssh -p 27236 glows@tw-07.access.glows.ai

# 编辑 postgresql.conf
sudo nano /etc/postgresql/12/main/postgresql.conf

# 找到 listen_addresses，修改为：
listen_addresses = '*'  # 或 '0.0.0.0'

# 保存并退出
```

**步骤2：修改 pg_hba.conf**

```bash
# 编辑 pg_hba.conf
sudo nano /etc/postgresql/12/main/pg_hba.conf

# 添加允许外部连接的规则（在文件末尾）：
host    qa_generator_db    user    0.0.0.0/0    md5

# 或者更安全的方式，只允许特定IP：
host    qa_generator_db    user    [Vercel IP范围]    md5
```

**步骤3：配置防火墙**

```bash
# 检查防火墙状态
sudo ufw status

# 如果防火墙开启，需要开放5432端口
sudo ufw allow 5432/tcp

# 或者只允许特定IP（更安全）
sudo ufw allow from [Vercel IP] to any port 5432
```

**步骤4：重启 PostgreSQL**

```bash
sudo systemctl restart postgresql
```

**步骤5：验证外部连接**

```bash
# 从本地测试（应该能连接）
psql -h tw-07.access.glows.ai -p 5432 -U user -d qa_generator_db
```

#### 方案2：使用 SSH 隧道（不推荐用于生产环境）

Vercel Serverless Functions 不支持持久 SSH 连接，所以这个方案不适用。

#### 方案3：使用数据库代理/连接池（高级方案）

可以使用 pgBouncer 或类似的连接池工具，但这需要额外的配置。

## 🔒 安全建议

1. **使用 SSL 连接**（已配置 `sslmode=require`）
2. **限制 IP 访问**：只允许 Vercel IP 范围访问
3. **使用强密码**
4. **定期更新 PostgreSQL**
5. **监控数据库连接日志**

## 📋 Vercel IP 范围

Vercel 的 IP 地址是动态的，但可以通过以下方式获取：

1. 查看 Vercel Function Logs，找到请求的源 IP
2. 或者使用通配符允许所有 IP（不推荐，但可以先用这个测试）

## ✅ 测试命令

配置完成后，使用以下命令测试：

```bash
# 从本地测试外部连接
psql "postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require"
```

## 📝 下一步

1. 按照方案1配置 PostgreSQL 接受外部连接
2. 配置防火墙规则
3. 测试外部连接
4. 在 Vercel 中设置 `DATABASE_URL` 环境变量
5. 重新部署并测试

