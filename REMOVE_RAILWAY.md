# 🗑️ 移除 Railway 依赖指南

## ✅ 已完成的工作

### 1. 更新前端 API 配置

✅ **移除环境变量依赖**
- `API_BASE_URL` 现在固定为 `/api`（相对路径）
- 不再使用 `VITE_API_BASE_URL` 环境变量
- 确保所有 API 调用都指向 Vercel Functions

### 2. 更新 Vite 配置

✅ **移除本地代理**
- 移除了指向本地后端（`http://127.0.0.1:8000`）的代理配置
- 本地开发时可以使用 `vercel dev` 来运行 Functions

## 🔧 Vercel 环境变量设置

### 必须设置的环境变量

在 Vercel Dashboard 中，**只设置以下环境变量**：

- ✅ `OPENAI_API_KEY` - OpenAI API Key（必需）

### 不要设置的环境变量

❌ **不要设置** `VITE_API_BASE_URL` - 前端现在使用固定的 `/api` 路径

## 🚀 部署步骤

### 步骤 1: 检查 Vercel 环境变量

1. 登录 Vercel Dashboard
2. 进入项目设置
3. 检查 **Environment Variables**
4. **删除** `VITE_API_BASE_URL`（如果存在）
5. **确保** `OPENAI_API_KEY` 已设置

### 步骤 2: 重新部署

1. 推送代码到 GitHub
2. Vercel 会自动重新部署
3. 等待部署完成

### 步骤 3: 验证

1. 访问部署的前端应用
2. 尝试生成问答对
3. 检查浏览器控制台，确认 API 调用指向 `/api/generate`（不是 Railway）

## 📋 API 端点

所有 API 现在都通过 Vercel Functions 提供：

- `POST /api/generate` - 生成问答对
- `POST /api/review` - 审查问答对
- `GET /api/categories` - 获取分类

## ⚠️ 重要提示

1. **不再需要 Railway**：所有后端功能都在 Vercel Functions 中
2. **环境变量**：只在 Vercel 中设置 `OPENAI_API_KEY`
3. **API 路径**：前端使用相对路径 `/api`，会自动调用 Vercel Functions
4. **本地开发**：可以使用 `vercel dev` 来运行本地 Functions

## 🔍 故障排除

### 问题 1: 仍然调用 Railway

**原因：** Vercel 环境变量中设置了 `VITE_API_BASE_URL`

**解决：**
1. 在 Vercel Dashboard 中删除 `VITE_API_BASE_URL`
2. 重新部署

### 问题 2: API 返回 404

**原因：** Vercel Functions 路径不正确

**解决：**
1. 确认 `/api` 目录下有对应的 Functions
2. 确认 `vercel.json` 配置正确

### 问题 3: CORS 错误

**原因：** API Functions 没有正确配置 CORS

**解决：**
- 检查 API Functions 中的 CORS 配置
- 确保设置了 `Access-Control-Allow-Origin` 头

## ✅ 检查清单

- [ ] 删除 Vercel 环境变量中的 `VITE_API_BASE_URL`
- [ ] 确保 `OPENAI_API_KEY` 已设置
- [ ] 代码已更新（API_BASE_URL = '/api'）
- [ ] 重新部署到 Vercel
- [ ] 测试生成功能
- [ ] 确认浏览器控制台中没有 Railway URL

