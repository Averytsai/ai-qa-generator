# 网络连接问题分析

## 🔍 问题诊断

### 当前状态
- ✅ PostgreSQL 配置正确：
  - `listen_addresses = '*'`
  - PostgreSQL 监听在 `0.0.0.0:5432`
  - `pg_hba.conf` 有允许外部连接的规则
- ✅ 服务器防火墙未启用
- ✅ iptables 没有阻止 5432 端口
- ❌ **外部连接超时**

### 根本原因

服务器在**私有网络**中（192.168.122.204），需要通过 NAT 网关访问。

**问题**：NAT 网关或路由器可能没有将 5432 端口映射到服务器。

## 🔧 解决方案

### 方案1：配置端口转发（推荐）

需要在**云服务商控制面板**或**路由器配置**中添加端口转发规则：

```
外部端口: 5432
内部IP: 192.168.122.204
内部端口: 5432
协议: TCP
```

### 方案2：使用 SSH 隧道（临时方案）

如果无法配置端口转发，可以使用 SSH 隧道：

```bash
# 在本地创建SSH隧道
ssh -p 27236 -L 5432:localhost:5432 glows@tw-07.access.glows.ai

# 然后在另一个终端测试
psql "postgresql://user:password@localhost:5432/qa_generator_db"
```

**注意**：Vercel 无法使用 SSH 隧道，这只适用于本地测试。

### 方案3：使用云服务商的数据库服务

如果无法配置端口转发，考虑：
1. 使用云服务商提供的托管 PostgreSQL 服务
2. 或使用 Vercel Postgres（如果可用）

## 📋 需要检查的事项

1. **云服务商控制面板**：
   - 检查安全组/防火墙规则
   - 确认 5432 端口已开放
   - 检查端口转发规则

2. **网络配置**：
   - 确认服务器可以通过公网访问
   - 检查 NAT 网关配置

3. **测试连接**：
   ```bash
   # 从服务器本地测试（应该成功）
   psql -h localhost -U user -d qa_generator_db
   
   # 从外部测试（当前失败）
   psql "postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require"
   ```

## 🎯 下一步

1. **联系服务器管理员**配置端口转发
2. **或使用 SSH 隧道**进行本地测试
3. **或迁移到云数据库服务**

