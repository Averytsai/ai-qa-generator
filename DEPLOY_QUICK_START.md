# 🚀 快速部署指南

## ✅ 已完成

- ✅ 前端代码已配置支持环境变量
- ✅ 后端 CORS 配置已修复
- ✅ 创建了部署所需的文件（Procfile, requirements.txt）
- ✅ 代码已推送到 GitHub

## 📋 下一步：部署后端

### 推荐方案：Railway（最简单）

1. **注册并创建项目**
   - 访问：https://railway.app
   - 使用 GitHub 登录
   - New Project → Deploy from GitHub repo
   - 选择仓库：`ai-qa-generator`

2. **配置服务**
   - Railway 会自动检测 Python
   - 设置启动命令：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - 或者使用 Procfile（已创建）

3. **创建数据库**
   - 点击 "New" → "Database" → "PostgreSQL"
   - Railway 会自动创建并配置

4. **配置环境变量**
   在项目设置中添加：
   ```
   DATABASE_URL=<Railway 自动提供的数据库连接>
   OPENAI_API_KEY=<你的 OpenAI Key>
   ANTHROPIC_API_KEY=<你的 Anthropic Key>
   APP_ENV=production
   DEBUG=False
   SECRET_KEY=<随机字符串>
   CORS_ORIGINS=https://ai-qa-generator.vercel.app
   ```

5. **部署**
   - Railway 会自动部署
   - 等待部署完成
   - 复制生成的域名（例如：`your-app.up.railway.app`）

## 🔧 配置前端连接后端

1. **登录 Vercel**
   - https://vercel.com/dashboard
   - 进入项目 `ai-qa-generator`

2. **添加环境变量**
   - Settings → Environment Variables
   - 添加：
     - Name: `VITE_API_BASE_URL`
     - Value: `https://your-backend-domain.up.railway.app/api/v1`
     - Environment: Production, Preview, Development（全选）

3. **重新部署前端**
   - Deployments → 点击最新部署 → Redeploy
   - 或推送新的 commit

## ✅ 验证

1. **测试后端**
   ```bash
   curl https://your-backend-domain.up.railway.app/health
   ```
   应该返回：`{"status":"healthy","environment":"production"}`

2. **测试前端**
   - 访问：https://ai-qa-generator.vercel.app
   - 打开浏览器开发者工具（F12）
   - 查看 Network 标签
   - API 请求应该指向后端域名

## 📚 详细文档

- 后端部署详细指南：`BACKEND_DEPLOYMENT.md`
- Vercel 配置检查：`VERCEL_CHECKLIST.md`

## 🆘 需要帮助？

如果遇到问题，检查：
1. 后端部署是否成功（Railway Dashboard）
2. 环境变量是否正确配置
3. CORS 配置是否正确
4. 前端环境变量是否已设置并重新部署

