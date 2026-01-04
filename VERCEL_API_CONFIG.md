# Vercel 前端 API 配置指南

## 🔴 问题

前端无法连接到后端 API，因为缺少 `VITE_API_BASE_URL` 环境变量。

## ✅ 解决方案

### 步骤 1: 获取 Railway 后端地址

1. **登录 Railway Dashboard**
   - https://railway.app/dashboard

2. **找到你的后端服务**
   - 选择你的项目
   - 点击后端服务（不是数据库服务）

3. **获取域名**
   - 方法 1: Settings → Domains
     - 如果有自定义域名，使用自定义域名
     - 如果没有，使用 Railway 提供的默认域名（例如：`your-app.up.railway.app`）
   
   - 方法 2: Settings → Networking
     - 查看 "Public Networking"
     - 复制显示的域名

4. **确认后端地址格式**
   - 应该是：`https://your-app.up.railway.app`
   - **不要**包含 `/api/v1`（前端会自动添加）

### 步骤 2: 在 Vercel 中配置环境变量

1. **登录 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **进入项目设置**
   - 选择项目：`ai-qa-generator`
   - 点击 "Settings" 标签
   - 点击 "Environment Variables" 标签

3. **添加环境变量**
   - 点击 "Add New"
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-railway-app.up.railway.app/api/v1`
     - ⚠️ **重要：** 必须包含 `/api/v1` 后缀
     - 例如：`https://your-app.up.railway.app/api/v1`
   - **Environment:** 选择所有环境（Production, Preview, Development）
   - 点击 "Save"

4. **重新部署前端**
   - 方法 1: 自动部署
     - 推送新的 commit 到 GitHub
     - Vercel 会自动重新部署
   
   - 方法 2: 手动重新部署
     - Deployments → 点击最新部署
     - 点击 "Redeploy"

### 步骤 3: 验证配置

1. **检查浏览器控制台**
   - 打开 https://ai-qa-generator.vercel.app
   - 按 F12 打开开发者工具
   - 切换到 "Console" 标签
   - 尝试点击"生成問答對"
   - 查看 Network 标签中的请求
   - API 请求应该指向你的 Railway 后端地址

2. **检查 API 请求**
   - Network 标签中应该看到：
     - URL: `https://your-railway-app.up.railway.app/api/v1/generator/generate`
     - Status: 200 (成功) 或具体的错误信息

3. **测试后端连接**
   ```bash
   curl https://your-railway-app.up.railway.app/health
   ```
   应该返回：`{"status":"healthy","environment":"production"}`

## 📋 配置检查清单

- [ ] 已获取 Railway 后端域名
- [ ] 已在 Vercel 添加 `VITE_API_BASE_URL` 环境变量
- [ ] 环境变量值包含 `/api/v1` 后缀
- [ ] 已选择所有环境（Production, Preview, Development）
- [ ] 已重新部署前端
- [ ] 已测试前端功能

## 🔍 常见问题

### 问题 1: CORS 错误

**错误信息：** `Access to XMLHttpRequest has been blocked by CORS policy`

**解决方案：**
- 在 Railway 后端的环境变量中，确认 `CORS_ORIGINS` 包含前端域名：
  ```
  CORS_ORIGINS=https://ai-qa-generator.vercel.app
  ```
- 重新部署后端

### 问题 2: 404 Not Found

**错误信息：** `404` 或 `Not Found`

**可能原因：**
- `VITE_API_BASE_URL` 值不正确
- 没有包含 `/api/v1` 后缀
- Railway 后端域名错误

**解决方案：**
- 检查 `VITE_API_BASE_URL` 值
- 确认格式：`https://your-app.up.railway.app/api/v1`
- 测试后端健康检查端点

### 问题 3: 环境变量未生效

**解决方案：**
- 确认环境变量名称正确：`VITE_API_BASE_URL`（注意 `VITE_` 前缀）
- 添加环境变量后必须重新部署
- 检查是否选择了正确的环境（Production/Preview/Development）

### 问题 4: 网络请求失败

**错误信息：** `Network Error` 或 `Failed to fetch`

**可能原因：**
- Railway 后端未运行
- 后端域名错误
- 网络连接问题

**解决方案：**
- 检查 Railway Dashboard 确认后端正在运行
- 测试后端健康检查端点
- 检查浏览器控制台的详细错误信息

## 💡 调试技巧

### 1. 检查环境变量是否正确加载

在浏览器控制台运行：
```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
```

应该显示你设置的 Railway 后端地址。

### 2. 检查 API 请求

在浏览器 Network 标签中：
- 查看请求的 URL
- 确认指向正确的后端地址
- 查看响应状态和错误信息

### 3. 检查后端日志

在 Railway Dashboard：
- Deployments → 点击最新部署
- 查看日志
- 确认是否有请求到达后端

## 📝 完整配置示例

### Vercel 环境变量

```
VITE_API_BASE_URL=https://your-app.up.railway.app/api/v1
```

### Railway 环境变量（确认已配置）

```
DATABASE_URL=postgresql://...
SECRET_KEY=...
APP_ENV=production
DEBUG=False
CORS_ORIGINS=https://ai-qa-generator.vercel.app
```

## ✅ 成功标志

配置成功后：
- ✅ 前端可以正常加载
- ✅ 点击"生成問答對"可以发送请求
- ✅ 浏览器 Network 标签显示请求成功
- ✅ 后端日志显示收到请求
- ✅ 可以正常生成问答对

