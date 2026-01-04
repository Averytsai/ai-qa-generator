# PostgreSQL 外部连接配置 - 手动操作步骤

由于需要 sudo 权限，请按照以下步骤手动操作：

## 🔧 配置步骤

### 步骤1: SSH 连接到服务器

```bash
ssh -p 27236 glows@tw-07.access.glows.ai
# 密码: tJhRU(-mV2nctf2B
```

### 步骤2: 备份配置文件

```bash
sudo cp /etc/postgresql/12/main/postgresql.conf /etc/postgresql/12/main/postgresql.conf.backup.$(date +%Y%m%d_%H%M%S)
sudo cp /etc/postgresql/12/main/pg_hba.conf /etc/postgresql/12/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)
```

### 步骤3: 修改 postgresql.conf

```bash
sudo nano /etc/postgresql/12/main/postgresql.conf
```

找到这一行（大约在第59行）：
```
#listen_addresses = 'localhost'
```

或者：
```
listen_addresses = 'localhost'
```

修改为：
```
listen_addresses = '*'
```

保存并退出（Ctrl+O, Enter, Ctrl+X）

### 步骤4: 修改 pg_hba.conf

```bash
sudo nano /etc/postgresql/12/main/pg_hba.conf
```

在文件末尾添加以下行：
```
# Allow external connections for Vercel
host    qa_generator_db    user    0.0.0.0/0    md5
```

保存并退出（Ctrl+O, Enter, Ctrl+X）

### 步骤5: 配置防火墙（如果需要）

检查防火墙状态：
```bash
sudo ufw status
```

如果防火墙已启用，开放5432端口：
```bash
sudo ufw allow 5432/tcp
sudo ufw reload
```

### 步骤6: 重启 PostgreSQL

```bash
sudo systemctl restart postgresql
```

检查服务状态：
```bash
sudo systemctl status postgresql
```

应该看到 "active (running)"

### 步骤7: 验证配置

检查 listen_addresses：
```bash
sudo grep -E '^[^#]*listen_addresses' /etc/postgresql/12/main/postgresql.conf
```

应该看到：
```
listen_addresses = '*'
```

检查 pg_hba.conf：
```bash
sudo tail -3 /etc/postgresql/12/main/pg_hba.conf
```

应该看到：
```
host    qa_generator_db    user    0.0.0.0/0    md5
```

检查 PostgreSQL 监听地址：
```bash
sudo netstat -tlnp | grep 5432
```

应该看到类似：
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      [PID]/postgres
```

### 步骤8: 测试外部连接

从本地机器测试：
```bash
psql "postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require"
```

如果连接成功，会看到 PostgreSQL 提示符。

## ✅ 配置完成后

1. **在 Vercel Dashboard 中设置环境变量**：
   - `DATABASE_URL=postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require`
   - `OPENAI_API_KEY=sk-...`（您的 OpenAI API Key）

2. **重新部署 Vercel 应用**

3. **测试功能**：
   - 生成问答对
   - 查看知识库

## 🔒 安全建议

如果担心安全，可以限制IP访问：

在 `pg_hba.conf` 中，将：
```
host    qa_generator_db    user    0.0.0.0/0    md5
```

改为只允许特定IP（需要先获取Vercel的IP范围）：
```
host    qa_generator_db    user    [Vercel IP]/32    md5
```

## ❓ 遇到问题？

如果重启失败，查看日志：
```bash
sudo journalctl -u postgresql -n 50
```

如果连接仍然失败，检查：
1. PostgreSQL 是否正在运行：`sudo systemctl status postgresql`
2. 防火墙是否阻止：`sudo ufw status`
3. 网络连接：`ping tw-07.access.glows.ai`

