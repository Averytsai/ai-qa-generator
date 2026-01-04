# 后端部署指南

## 🎯 问题说明

你的前端部署在 Vercel，但后端还在本地运行。生产环境的前端无法访问本地的后端 API，所以需要将后端也部署到云端。

## 🚀 推荐的后端部署平台

### 方案 1: Railway（推荐，最简单）⭐

**优点：**
- 免费额度充足（$5/月免费额度）
- 自动检测 Python/FastAPI
- 自动配置数据库
- 支持环境变量
- 部署简单

**步骤：**

1. **注册账号**
   - 访问：https://railway.app
   - 使用 GitHub 账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库 `ai-qa-generator`

3. **配置服务**
   - Railway 会自动检测到 Python 项目
   - 设置 Root Directory：留空（使用根目录）
   - 设置启动命令：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **配置数据库**
   - 点击 "New" → "Database" → "PostgreSQL"
   - Railway 会自动创建 PostgreSQL 数据库
   - 复制数据库连接字符串

5. **配置环境变量**
   - 在项目设置中添加环境变量：
     ```
     DATABASE_URL=<Railway 提供的数据库连接字符串>
     OPENAI_API_KEY=<你的 OpenAI API Key>
     ANTHROPIC_API_KEY=<你的 Anthropic API Key>
     APP_ENV=production
     DEBUG=False
     ```

6. **部署**
   - Railway 会自动部署
   - 部署完成后，复制生成的域名（例如：`your-app.up.railway.app`）

7. **配置前端**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 添加：`VITE_API_BASE_URL=https://your-app.up.railway.app/api/v1`
   - 重新部署前端

### 方案 2: Render（免费，但有限制）

**优点：**
- 免费套餐可用
- 支持 PostgreSQL
- 自动部署

**缺点：**
- 免费套餐在 15 分钟无活动后会休眠
- 首次访问需要等待启动

**步骤：**

1. **注册账号**
   - 访问：https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库
   - 设置：
     - Name: `ai-qa-generator-backend`
     - Environment: `Python 3`
     - Build Command: `pip install -r requirements/base.txt`
     - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **创建 PostgreSQL 数据库**
   - 点击 "New" → "PostgreSQL"
   - 复制数据库连接字符串

4. **配置环境变量**
   - 在 Web Service 设置中添加环境变量（同 Railway）

5. **部署和配置前端**（同 Railway）

### 方案 3: Fly.io（性能好，但配置复杂）

**优点：**
- 性能好
- 全球 CDN
- 免费额度充足

**缺点：**
- 配置相对复杂
- 需要安装 CLI

### 方案 4: Heroku（付费，但稳定）

**优点：**
- 稳定可靠
- 生态成熟

**缺点：**
- 不再有免费套餐
- 需要付费

## 📋 部署前准备

### 1. 创建 requirements.txt

在项目根目录创建 `requirements.txt`（如果还没有）：

```bash
cd "/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手"
cat requirements/base.txt > requirements.txt
```

### 2. 创建 Procfile（Railway/Render 需要）

在项目根目录创建 `Procfile`：

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 3. 检查 CORS 配置

确保 `app/main.py` 中的 CORS 配置允许前端域名：

```python
# 生产环境需要添加前端域名
allow_origins=[
    "https://ai-qa-generator.vercel.app",
    "https://your-frontend-domain.vercel.app"
]
```

## 🔧 配置前端环境变量

部署后端后，需要在 Vercel 中配置环境变量：

1. **登录 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **进入项目设置**
   - 选择项目 `ai-qa-generator`
   - Settings → Environment Variables

3. **添加环境变量**
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-domain.com/api/v1`
   - Environment: Production, Preview, Development（全选）

4. **重新部署**
   - 修改环境变量后需要重新部署才能生效
   - Deployments → 点击最新部署 → Redeploy

## ✅ 验证部署

### 1. 测试后端 API

```bash
# 健康检查
curl https://your-backend-domain.com/health

# API 文档
访问 https://your-backend-domain.com/docs
```

### 2. 测试前端连接

- 打开浏览器开发者工具（F12）
- 访问前端网站
- 查看 Network 标签
- API 请求应该指向后端域名

## 🆘 常见问题

### 问题 1: CORS 错误

**错误信息：** `Access to XMLHttpRequest has been blocked by CORS policy`

**解决方案：**
- 在 `app/main.py` 中添加前端域名到 `allow_origins`

### 问题 2: 数据库连接失败

**解决方案：**
- 检查 `DATABASE_URL` 环境变量是否正确
- 确认数据库服务已启动
- 检查数据库迁移是否完成

### 问题 3: 环境变量未生效

**解决方案：**
- Vercel 的环境变量需要重新部署才能生效
- 确认环境变量名称正确（Vite 需要 `VITE_` 前缀）

## 📝 快速部署检查清单

- [ ] 选择部署平台（推荐 Railway）
- [ ] 创建项目并连接 GitHub
- [ ] 配置启动命令
- [ ] 创建 PostgreSQL 数据库
- [ ] 配置环境变量（DATABASE_URL, API Keys）
- [ ] 部署后端
- [ ] 测试后端 API（/health, /docs）
- [ ] 在 Vercel 配置 VITE_API_BASE_URL
- [ ] 重新部署前端
- [ ] 测试前端功能

## 💡 推荐方案

**最简单快速：Railway**
- 注册 → 连接 GitHub → 自动部署 → 配置环境变量 → 完成

需要我帮你创建 `Procfile` 和 `requirements.txt` 吗？

