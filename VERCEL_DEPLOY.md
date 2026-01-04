# Vercel 部署指南

## ✅ 配置已完成

项目已配置好 `frontend/vercel.json`，可以直接部署到 Vercel。

## 🚀 部署步骤

### 方法 1：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 Git 仓库

3. **配置项目设置**
   - **Root Directory**: 设置为 `frontend`
   - **Framework Preset**: 选择 "Vite"
   - **Build Command**: `npm run build`（会自动识别）
   - **Output Directory**: `dist`（会自动识别）

4. **环境变量（如果需要）**
   - 如果后端 API 不在同一域名，可能需要设置环境变量
   - 例如：`VITE_API_BASE_URL=https://your-backend-api.com`

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 方法 2：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 进入前端目录
cd frontend

# 部署
vercel

# 按照提示操作：
# - 是否链接现有项目？选择 Y 或 N
# - 项目名称：输入你的项目名
# - 目录：确认是 frontend 目录
```

## 📋 配置说明

### vercel.json 配置

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**关键配置解释：**
- `rewrites`: 将所有路由重定向到 `index.html`，让 React Router 处理客户端路由
- `buildCommand`: 构建命令
- `outputDirectory`: 构建输出目录

## ✅ 验证部署

部署成功后，测试以下功能：

1. **首页**: `https://your-app.vercel.app/`
2. **生成页面**: `https://your-app.vercel.app/generate`
3. **审查页面**: `https://your-app.vercel.app/review`
4. **刷新页面**: 在任意页面刷新，应该不会出现 404

## 🔧 常见问题

### 问题 1: 仍然出现 NOT_FOUND 错误

**解决方案：**
- 确认在 Vercel 项目设置中，Root Directory 设置为 `frontend`
- 确认 `frontend/vercel.json` 文件存在
- 重新部署项目

### 问题 2: API 请求失败

**原因：** 前端 API 配置指向 `/api/v1`，但后端可能不在同一域名

**解决方案：**
1. 如果后端也在 Vercel，配置 API 路由
2. 如果后端在其他地方，修改 `frontend/src/services/api.ts` 中的 `API_BASE_URL`
3. 或使用环境变量配置 API 地址

### 问题 3: 构建失败

**检查：**
- Node.js 版本（Vercel 会自动检测，通常是 18.x）
- 依赖是否正确安装
- TypeScript 编译是否有错误

## 📝 注意事项

1. **Root Directory 必须设置为 `frontend`**
   - 这是最重要的设置
   - 在 Vercel Dashboard → Settings → General → Root Directory

2. **API 代理**
   - 开发环境：Vite 代理 `/api` 到 `http://localhost:8000`
   - 生产环境：需要配置实际的 API 地址

3. **环境变量**
   - 如果需要，在 Vercel Dashboard → Settings → Environment Variables 中设置

## 🎉 完成

配置完成后，你的应用应该可以正常访问所有路由了！

