# PostgreSQL 外部连接快速配置指南

## ✅ 当前状态

- ✅ `listen_addresses` 已设置为 `*`
- ⚠️  需要重启 PostgreSQL 服务
- ⚠️  需要配置 `pg_hba.conf`

## 🚀 快速配置（3步）

### 步骤1: SSH 连接并检查配置

```bash
ssh -p 27236 glows@tw-07.access.glows.ai
# 密码: tJhRU(-mV2nctf2B
```

### 步骤2: 添加外部访问规则（需要 sudo 密码）

```bash
# 检查是否已有规则
sudo grep "qa_generator_db.*user.*0.0.0.0" /etc/postgresql/12/main/pg_hba.conf

# 如果没有，添加规则
echo "" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
echo "# Allow external connections for Vercel" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
echo "host    qa_generator_db    user    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
```

### 步骤3: 重启 PostgreSQL（需要 sudo 密码）

```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql  # 确认服务运行正常
```

## ✅ 验证配置

在服务器上执行：

```bash
# 检查 listen_addresses
sudo grep "listen_addresses" /etc/postgresql/12/main/postgresql.conf | grep -v "^#"

# 检查 pg_hba.conf
sudo tail -3 /etc/postgresql/12/main/pg_hba.conf

# 检查监听地址
sudo netstat -tlnp | grep 5432
```

应该看到：
- `listen_addresses = '*'`
- `host    qa_generator_db    user    0.0.0.0/0    md5`
- PostgreSQL 监听在 `0.0.0.0:5432`

## 🧪 测试外部连接

从本地机器测试：

```bash
cd database
DATABASE_URL="postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require" node test_connection.js
```

如果连接成功，会看到：
```
✅ 数据库连接成功！
✅ 所有测试通过！数据库连接正常。
```

## 📝 配置完成后

1. **在 Vercel Dashboard 设置环境变量**：
   - `DATABASE_URL=postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require`
   - `OPENAI_API_KEY=sk-...`

2. **重新部署 Vercel 应用**

3. **测试功能**

## ❓ 如果仍然无法连接

1. **检查防火墙**：
   ```bash
   sudo ufw status
   sudo ufw allow 5432/tcp  # 如果需要
   ```

2. **检查 PostgreSQL 日志**：
   ```bash
   sudo journalctl -u postgresql -n 50
   ```

3. **检查网络连接**：
   ```bash
   ping tw-07.access.glows.ai
   telnet tw-07.access.glows.ai 5432
   ```

