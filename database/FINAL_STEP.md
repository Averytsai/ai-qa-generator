# 🎯 最后一步：重启 PostgreSQL

## ✅ 已完成

- ✅ `listen_addresses` 已设置为 `*`
- ✅ `pg_hba.conf` 已添加外部访问规则

## 🔄 需要执行：重启 PostgreSQL

由于需要 sudo 权限，请手动执行以下命令：

### 方法1：直接 SSH 执行（推荐）

```bash
ssh -p 27236 glows@tw-07.access.glows.ai
# 密码: tJhRU(-mV2nctf2B

# 重启 PostgreSQL（会提示输入 sudo 密码）
sudo systemctl restart postgresql

# 确认服务运行正常
sudo systemctl status postgresql

# 验证配置
sudo grep "listen_addresses" /etc/postgresql/12/main/postgresql.conf | grep -v "^#"
sudo tail -3 /etc/postgresql/12/main/pg_hba.conf
sudo netstat -tlnp | grep 5432
```

### 方法2：使用脚本（需要输入 sudo 密码）

```bash
cd database
./restart_postgres.sh
```

## ✅ 验证连接

重启完成后，从本地测试：

```bash
cd database
DATABASE_URL="postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require" node test_connection.js
```

如果看到 "✅ 所有测试通过！数据库连接正常。"，说明配置成功！

## 📝 配置完成后

1. **在 Vercel Dashboard 设置环境变量**：
   - `DATABASE_URL=postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require`
   - `OPENAI_API_KEY=sk-...`

2. **重新部署 Vercel 应用**

3. **测试功能**

