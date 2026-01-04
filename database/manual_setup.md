# 手动执行数据库设置

如果无法从本地连接到数据库服务器（防火墙限制），请在数据库服务器上手动执行SQL脚本。

## 方法1：在数据库服务器上执行

### 1. 登录到数据库服务器
```bash
ssh user@tw-07.access.glows.ai
```

### 2. 连接到PostgreSQL
```bash
psql -U user -d qa_generator_db
```

### 3. 执行SQL脚本
```sql
\i /path/to/schema.sql
```

或者直接复制粘贴 `schema.sql` 的内容到 psql 中执行。

## 方法2：使用数据库管理工具

### 使用 pgAdmin、DBeaver 或其他工具

1. **连接到数据库**
   - 主机：`tw-07.access.glows.ai`
   - 端口：`5432`
   - 数据库：`qa_generator_db`
   - 用户名：`user`
   - 密码：`password`
   - SSL模式：`require`

2. **执行SQL脚本**
   - 打开 `schema.sql` 文件
   - 复制所有内容
   - 在查询窗口中粘贴并执行

## 方法3：使用psql命令行（如果可以从服务器访问）

```bash
psql -h tw-07.access.glows.ai -p 5432 -U user -d qa_generator_db -f schema.sql
```

系统会提示输入密码，输入 `password`

## 验证设置

执行以下SQL验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 应该看到：
-- feedbacks
-- qa_pairs

-- 查看qa_pairs表结构
\d qa_pairs

-- 查看feedbacks表结构
\d feedbacks

-- 查看索引
\di
```

## 如果遇到权限问题

如果遇到权限错误，可能需要以postgres超级用户身份执行：

```bash
sudo -u postgres psql -d qa_generator_db -f schema.sql
```

