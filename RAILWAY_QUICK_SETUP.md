# Railway 快速配置指南

## ✅ 已获取的信息

- ✅ DATABASE_URL: `postgresql://postgres:FcFhgdlvdOHLQeGLwhHFMPddWrIRrHUc@nozomi.proxy.rlwy.net:52926/railway`
- ✅ SECRET_KEY: `GJOxqnCzjT8_4r0q3EnWJWxsW-p2A1qb7v-EMawtYzw`

## 🚀 立即操作步骤

### 步骤 1: 登录 Railway Dashboard

访问：https://railway.app/dashboard

### 步骤 2: 进入项目设置

1. 选择你的项目（`ai-qa-generator` 或类似名称）
2. 点击主服务（不是数据库服务）
3. 点击 "Settings" 标签
4. 点击 "Variables" 标签

### 步骤 3: 添加环境变量

点击 "New Variable"，逐个添加以下变量：

#### 变量 1: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** `postgresql://postgres:FcFhgdlvdOHLQeGLwhHFMPddWrIRrHUc@nozomi.proxy.rlwy.net:52926/railway`
- 点击 "Add"

#### 变量 2: SECRET_KEY
- **Name:** `SECRET_KEY`
- **Value:** `GJOxqnCzjT8_4r0q3EnWJWxsW-p2A1qb7v-EMawtYzw`
- 点击 "Add"

#### 变量 3: APP_ENV
- **Name:** `APP_ENV`
- **Value:** `production`
- 点击 "Add"

#### 变量 4: DEBUG
- **Name:** `DEBUG`
- **Value:** `False`
- 点击 "Add"

#### 变量 5: PYTHON_VERSION
- **Name:** `PYTHON_VERSION`
- **Value:** `3.11`
- 点击 "Add"

#### 变量 6: CORS_ORIGINS
- **Name:** `CORS_ORIGINS`
- **Value:** `https://ai-qa-generator.vercel.app`
- 点击 "Add"

### 步骤 4: 添加 AI API Keys（如果使用）

如果你有 OpenAI 或 Anthropic 的 API Key，也添加：

#### OpenAI（可选）
- **Name:** `OPENAI_API_KEY`
- **Value:** `你的 OpenAI API Key`
- 点击 "Add"

#### Anthropic（可选）
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** `你的 Anthropic API Key`
- 点击 "Add"

### 步骤 5: 重新部署

1. 添加完所有变量后
2. 进入 "Deployments" 页面
3. 点击最新的部署
4. 点击 "Redeploy" 按钮
5. 等待部署完成

## ✅ 验证部署

### 1. 查看日志

在 Railway Dashboard → Deployments → 点击最新部署 → 查看日志

**应该看到：**
- ✅ `應用程式啟動: AI問答集生成系統`
- ✅ `環境: production`
- ✅ `除錯模式: False`
- ✅ 没有 `ValidationError` 或 `Field required` 错误

### 2. 测试健康检查

```bash
curl https://your-app.up.railway.app/health
```

应该返回：
```json
{
  "status": "healthy",
  "environment": "production"
}
```

### 3. 测试 API 文档

访问：`https://your-app.up.railway.app/docs`

应该能看到 FastAPI 的 Swagger 文档页面。

## 📋 环境变量清单

确保以下变量都已添加：

- [x] `DATABASE_URL` - 数据库连接字符串
- [x] `SECRET_KEY` - 应用密钥
- [x] `APP_ENV` - 环境类型（production）
- [x] `DEBUG` - 调试模式（False）
- [x] `PYTHON_VERSION` - Python 版本（3.11）
- [x] `CORS_ORIGINS` - 前端域名
- [ ] `OPENAI_API_KEY` - OpenAI API Key（可选）
- [ ] `ANTHROPIC_API_KEY` - Anthropic API Key（可选）

## 🆘 如果还有问题

### 问题 1: 仍然显示 Field required

**解决：**
- 确认所有变量名都是大写（如 `DATABASE_URL` 不是 `database_url`）
- 确认变量值没有多余的空格
- 重新部署应用

### 问题 2: 数据库连接失败

**解决：**
- 确认 `DATABASE_URL` 格式正确
- 检查数据库服务是否正在运行
- 确认数据库迁移已完成（可能需要运行 `alembic upgrade head`）

### 问题 3: CORS 错误

**解决：**
- 确认 `CORS_ORIGINS` 包含正确的前端域名
- 多个域名用逗号分隔：`https://domain1.com,https://domain2.com`

## 📝 下一步

部署成功后：

1. **复制后端域名**
   - 在 Railway Dashboard → Settings → Domains
   - 复制生成的域名（例如：`your-app.up.railway.app`）

2. **配置前端**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 添加：`VITE_API_BASE_URL=https://your-app.up.railway.app/api/v1`
   - 重新部署前端

3. **测试完整流程**
   - 访问前端网站
   - 测试生成问答对功能
   - 确认前后端连接正常

