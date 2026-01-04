# 405 错误排查指南

## 🔴 错误：Request failed with status code 405

405 错误表示"Method Not Allowed"，通常是因为：
1. CORS 预检请求失败
2. API 路径不正确
3. HTTP 方法不匹配

## ✅ 排查步骤

### 步骤 1: 检查浏览器 Network 标签

1. 打开 https://ai-qa-generator.vercel.app
2. 按 F12 打开开发者工具
3. 切换到 Network 标签
4. 点击"生成問答對"
5. 查看请求详情：

**检查以下信息：**
- **Request URL:** 应该是什么？
  - 应该是：`https://your-railway-app.up.railway.app/api/v1/generator/generate`
- **Request Method:** 应该是 `POST`
- **Status Code:** 405
- **Request Headers:** 查看 `Origin` 和 `Access-Control-Request-Method`

### 步骤 2: 检查 CORS 配置

**在 Railway Dashboard 中检查后端环境变量：**

确认 `CORS_ORIGINS` 包含前端域名：
```
CORS_ORIGINS=https://ai-qa-generator.vercel.app
```

**如果还没有设置：**
1. Railway Dashboard → 后端服务 → Settings → Variables
2. 添加或更新 `CORS_ORIGINS`
3. 值：`https://ai-qa-generator.vercel.app`
4. 重新部署后端

### 步骤 3: 检查 API 路径

**确认前端环境变量：**

在 Vercel Dashboard → Settings → Environment Variables：
- `VITE_API_BASE_URL` 应该是：`https://your-railway-app.up.railway.app/api/v1`
- **必须包含** `/api/v1` 后缀

### 步骤 4: 测试后端 API

**直接测试后端端点：**

```bash
curl -X POST https://your-railway-app.up.railway.app/api/v1/generator/generate \
  -H "Content-Type: application/json" \
  -H "Origin: https://ai-qa-generator.vercel.app" \
  -d '{
    "category": "通用知识",
    "count": 1,
    "style": "专业"
  }'
```

**如果返回 405：**
- 检查后端路由是否正确注册
- 检查路径是否正确

**如果返回 CORS 错误：**
- 确认 `CORS_ORIGINS` 配置正确
- 重新部署后端

## 🔧 常见问题和解决方案

### 问题 1: CORS 预检请求失败

**症状：**
- Network 标签中看到 `OPTIONS` 请求返回 405
- 或者没有看到 `OPTIONS` 请求

**解决方案：**
1. 确认后端 `CORS_ORIGINS` 包含前端域名
2. 确认后端 CORS 配置允许 `POST` 方法
3. 重新部署后端

### 问题 2: API 路径错误

**症状：**
- 请求 URL 不正确
- 例如：`/api/v1/generator/generate` 而不是完整 URL

**解决方案：**
1. 检查 `VITE_API_BASE_URL` 环境变量
2. 确认值包含完整域名和 `/api/v1`
3. 重新部署前端

### 问题 3: HTTP 方法不匹配

**症状：**
- 前端发送 POST，但后端只接受 GET（不太可能，因为代码显示都是 POST）

**解决方案：**
- 检查后端路由定义
- 确认 `@router.post("/generate")` 存在

## 📋 检查清单

- [ ] 浏览器 Network 标签显示请求 URL 正确
- [ ] 请求方法是 POST
- [ ] `VITE_API_BASE_URL` 环境变量已设置
- [ ] Railway 后端 `CORS_ORIGINS` 包含前端域名
- [ ] 后端已重新部署
- [ ] 前端已重新部署
- [ ] 直接测试后端 API 成功

## 🆘 如果还是不行

请提供以下信息：
1. **浏览器 Network 标签中的请求 URL**（完整 URL）
2. **请求方法**（POST/GET/OPTIONS）
3. **响应状态码**（405）
4. **响应头信息**（特别是 CORS 相关）
5. **Railway 后端域名**（用于测试）

