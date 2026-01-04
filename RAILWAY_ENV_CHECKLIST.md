# Railway 环境变量完整检查清单

## 🔴 当前错误

```
ValidationError: 2 validation errors for Settings
secret_key - Field required
database_url - Field required
```

**原因：** Railway 后端服务缺少必需的环境变量。

## ✅ 逐步解决方案

### 步骤 1: 登录 Railway Dashboard

1. 访问：https://railway.app/dashboard
2. 登录你的账号

### 步骤 2: 找到后端服务

1. 选择你的项目
2. **重要：** 点击**后端服务**（不是数据库服务）
   - 后端服务通常显示为 "Web Service" 或类似名称
   - 数据库服务显示为 "PostgreSQL" 或 "Database"

### 步骤 3: 进入环境变量设置

1. 点击后端服务
2. 点击 **"Settings"** 标签
3. 点击 **"Variables"** 标签

### 步骤 4: 添加必需的环境变量

**逐个添加以下变量：**

#### 变量 1: DATABASE_URL ⚠️ 必需

1. 点击 **"New Variable"**
2. **Name:** `DATABASE_URL`
3. **Value:** `postgresql://postgres:FcFhgdlvdOHLQeGLwhHFMPddWrIRrHUc@nozomi.proxy.rlwy.net:52926/railway`
   - 这是你之前提供的数据库连接字符串
4. 点击 **"Add"**

#### 变量 2: SECRET_KEY ⚠️ 必需

1. 点击 **"New Variable"**
2. **Name:** `SECRET_KEY`
3. **Value:** `GJOxqnCzjT8_4r0q3EnWJWxsW-p2A1qb7v-EMawtYzw`
   - 这是之前生成的密钥
4. 点击 **"Add"**

#### 变量 3: APP_ENV

1. 点击 **"New Variable"**
2. **Name:** `APP_ENV`
3. **Value:** `production`
4. 点击 **"Add"**

#### 变量 4: DEBUG

1. 点击 **"New Variable"**
2. **Name:** `DEBUG`
3. **Value:** `False`
4. 点击 **"Add"**

#### 变量 5: CORS_ORIGINS

1. 点击 **"New Variable"**
2. **Name:** `CORS_ORIGINS`
3. **Value:** `https://ai-qa-generator.vercel.app`
4. 点击 **"Add"**

#### 变量 6: PYTHON_VERSION（如果还没有）

1. 点击 **"New Variable"**
2. **Name:** `PYTHON_VERSION`
3. **Value:** `3.11`
4. 点击 **"Add"**

### 步骤 5: 验证所有变量

**检查清单：**

在 Variables 列表中，确认以下变量都存在：

- [ ] `DATABASE_URL` = `postgresql://postgres:FcFhgdlvdOHLQeGLwhHFMPddWrIRrHUc@nozomi.proxy.rlwy.net:52926/railway`
- [ ] `SECRET_KEY` = `GJOxqnCzjT8_4r0q3EnWJWxsW-p2A1qb7v-EMawtYzw`
- [ ] `APP_ENV` = `production`
- [ ] `DEBUG` = `False`
- [ ] `CORS_ORIGINS` = `https://ai-qa-generator.vercel.app`
- [ ] `PYTHON_VERSION` = `3.11`（可选）

### 步骤 6: 重新部署

1. 添加完所有变量后
2. 进入 **"Deployments"** 标签
3. 点击最新的部署
4. 点击 **"Redeploy"** 按钮
5. 等待部署完成（通常 1-2 分钟）

### 步骤 7: 验证部署

部署成功后，检查日志：

**应该看到：**
- ✅ `應用程式啟動: AI問答集生成系統`
- ✅ `環境: production`
- ✅ `除錯模式: False`
- ✅ 没有 `Field required` 错误
- ✅ 没有 `ValidationError` 错误

**不应该看到：**
- ❌ `Field required`
- ❌ `ValidationError`
- ❌ `secret_key` 或 `database_url` 错误

### 步骤 8: 测试应用

1. **健康检查**
   ```bash
   curl https://web-production-ac7f.up.railway.app/health
   ```
   应该返回：`{"status":"healthy","environment":"production"}`

2. **API 文档**
   - 访问：`https://web-production-ac7f.up.railway.app/docs`
   - 应该看到 FastAPI Swagger 文档

## 🔍 常见问题

### 问题 1: 变量名大小写

**注意：** Railway 的环境变量是区分大小写的，但我们的配置不区分（`case_sensitive = False`）

**建议：** 使用大写字母命名（如 `DATABASE_URL`）

### 问题 2: 变量值格式错误

**检查：**
- 没有多余的空格
- 没有多余的引号
- 值完整（没有被截断）

### 问题 3: 变量未生效

**解决：**
- 添加变量后必须重新部署
- 确认变量名拼写正确
- 确认值格式正确

### 问题 4: 数据库连接失败

**检查：**
- `DATABASE_URL` 格式正确
- 数据库服务正在运行
- 数据库连接字符串完整

## 📋 完整环境变量列表

### 必需变量（必须添加）

```bash
DATABASE_URL=postgresql://postgres:FcFhgdlvdOHLQeGLwhHFMPddWrIRrHUc@nozomi.proxy.rlwy.net:52926/railway
SECRET_KEY=GJOxqnCzjT8_4r0q3EnWJWxsW-p2A1qb7v-EMawtYzw
```

### 推荐变量（建议添加）

```bash
APP_ENV=production
DEBUG=False
CORS_ORIGINS=https://ai-qa-generator.vercel.app
PYTHON_VERSION=3.11
```

### 可选变量（如果使用）

```bash
OPENAI_API_KEY=你的 OpenAI API Key
ANTHROPIC_API_KEY=你的 Anthropic API Key
```

## ✅ 最终验证清单

- [ ] 已登录 Railway Dashboard
- [ ] 已找到后端服务（不是数据库服务）
- [ ] 已进入 Settings → Variables
- [ ] 已添加 `DATABASE_URL`
- [ ] 已添加 `SECRET_KEY`
- [ ] 已添加 `APP_ENV`
- [ ] 已添加 `DEBUG`
- [ ] 已添加 `CORS_ORIGINS`
- [ ] 已重新部署后端
- [ ] 日志显示应用启动成功
- [ ] `/health` 端点返回正常
- [ ] `/docs` 端点可以访问

## 🆘 如果还是不行

请告诉我：
1. Railway Dashboard 中显示的环境变量列表（截图或列表）
2. 部署日志中的具体错误信息
3. 是否已经重新部署

