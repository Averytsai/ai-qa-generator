# Railway 环境变量配置指南

## 🔴 错误原因

应用启动失败是因为缺少必需的环境变量：
- `SECRET_KEY` - 必需
- `DATABASE_URL` - 必需

## ✅ 解决方案：配置环境变量

### 步骤 1: 登录 Railway Dashboard

访问：https://railway.app/dashboard

### 步骤 2: 进入项目设置

1. 选择你的项目
2. 点击 "Settings" 标签
3. 点击 "Variables" 标签

### 步骤 3: 添加必需的环境变量

#### 3.1 获取 DATABASE_URL

**如果还没有创建数据库：**

1. 在 Railway Dashboard 中
2. 点击 "New" → "Database" → "PostgreSQL"
3. Railway 会自动创建 PostgreSQL 数据库
4. 点击数据库服务
5. 在 "Variables" 标签中，找到 `DATABASE_URL`
6. 复制这个值

**如果已经有数据库：**

1. 点击数据库服务
2. 在 "Variables" 标签中
3. 找到 `DATABASE_URL`
4. 复制这个值

#### 3.2 生成 SECRET_KEY

可以使用以下方法生成一个随机的密钥：

**方法 1: 使用 Python**
```python
import secrets
print(secrets.token_urlsafe(32))
```

**方法 2: 使用在线工具**
- 访问：https://randomkeygen.com/
- 使用 "CodeIgniter Encryption Keys" 或 "Fort Knox Passwords"

**方法 3: 使用命令行**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 3.3 在 Railway 中添加环境变量

在项目的 "Variables" 页面，点击 "New Variable"，添加以下变量：

**必需变量：**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | Railway PostgreSQL 数据库连接字符串 |
| `SECRET_KEY` | `你的随机密钥` | 用于加密的密钥（至少 32 字符） |

**推荐变量：**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `APP_ENV` | `production` | 环境类型 |
| `DEBUG` | `False` | 生产环境关闭调试 |
| `OPENAI_API_KEY` | `你的 OpenAI Key` | OpenAI API 密钥（如果使用） |
| `ANTHROPIC_API_KEY` | `你的 Anthropic Key` | Anthropic API 密钥（如果使用） |
| `CORS_ORIGINS` | `https://ai-qa-generator.vercel.app` | 前端域名（多个用逗号分隔） |
| `PYTHON_VERSION` | `3.11` | Python 版本（如果还没设置） |

### 步骤 4: 保存并重新部署

1. 添加完所有环境变量后
2. 点击 "Save" 或变量会自动保存
3. 在 "Deployments" 页面
4. 点击 "Redeploy" 重新部署

## 📋 完整环境变量清单

### 最小配置（必需）

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here-at-least-32-characters-long
```

### 推荐配置（完整）

```bash
# 数据库
DATABASE_URL=postgresql://user:password@host:port/database

# 应用配置
SECRET_KEY=your-secret-key-here-at-least-32-characters-long
APP_ENV=production
DEBUG=False

# AI 模型（至少配置一个）
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# CORS（前端域名）
CORS_ORIGINS=https://ai-qa-generator.vercel.app

# Python 版本
PYTHON_VERSION=3.11
```

## 🔍 验证配置

部署成功后，检查日志：

1. **应该看到：**
   - `應用程式啟動: AI問答集生成系統`
   - `環境: production`
   - 没有验证错误

2. **不应该看到：**
   - `Field required`
   - `ValidationError`
   - `missing`

3. **测试应用：**
   ```bash
   curl https://your-app.up.railway.app/health
   ```
   应该返回：`{"status":"healthy","environment":"production"}`

## 🆘 常见问题

### 问题 1: DATABASE_URL 格式错误

**错误：** `DATABASE_URL 必須以 postgresql:// 或 postgresql+psycopg2:// 開頭`

**解决：**
- 确保从 Railway PostgreSQL 服务复制完整的连接字符串
- 格式应该是：`postgresql://user:password@host:port/database`

### 问题 2: SECRET_KEY 太短

**解决：**
- 使用至少 32 字符的随机字符串
- 可以使用上面的生成方法

### 问题 3: 环境变量未生效

**解决：**
- 确保变量名正确（大小写不敏感，但建议使用大写）
- 添加变量后必须重新部署
- 检查是否有拼写错误

## 📝 快速检查清单

- [ ] 已创建 PostgreSQL 数据库
- [ ] 已复制 `DATABASE_URL`
- [ ] 已生成 `SECRET_KEY`
- [ ] 已在 Railway Variables 中添加所有必需变量
- [ ] 已重新部署应用
- [ ] 检查日志确认没有错误
- [ ] 测试 `/health` 端点

## 💡 提示

- Railway 的环境变量是区分大小写的，但我们的配置不区分（`case_sensitive = False`）
- 建议使用大写字母命名环境变量（如 `DATABASE_URL`）
- 敏感信息（如 API Keys）不要提交到 Git
- 可以在 Railway Dashboard 中查看所有环境变量

