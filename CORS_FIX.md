# CORS 错误修复指南

## 🔴 问题

CORS 错误：`Access-Control-Allow-Origin` 头缺失

## ✅ 解决方案

### 步骤 1: 在 Railway 中设置 CORS_ORIGINS

1. **登录 Railway Dashboard**
   - https://railway.app/dashboard

2. **进入后端服务设置**
   - 选择你的后端服务（不是数据库服务）
   - Settings → Variables

3. **添加或更新 CORS_ORIGINS**
   - 点击 "New Variable" 或编辑现有变量
   - **Name:** `CORS_ORIGINS`
   - **Value:** `https://ai-qa-generator.vercel.app`
   - 点击 "Save"

4. **确认其他环境变量**
   - `APP_ENV` = `production`
   - `DEBUG` = `False`

5. **重新部署后端**
   - Deployments → 点击最新部署
   - 点击 "Redeploy"
   - 等待部署完成

### 步骤 2: 验证 CORS 配置

部署成功后，测试 CORS：

```bash
curl -X OPTIONS https://web-production-ac7f.up.railway.app/api/v1/generator/generate \
  -H "Origin: https://ai-qa-generator.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**应该看到响应头：**
```
Access-Control-Allow-Origin: https://ai-qa-generator.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
```

### 步骤 3: 测试前端

1. **访问前端**
   - https://ai-qa-generator.vercel.app

2. **打开浏览器开发者工具**
   - 按 F12
   - Network 标签

3. **测试生成功能**
   - 点击"生成問答對"
   - 查看 Network 标签
   - 应该看到：
     - OPTIONS 请求返回 200（预检请求）
     - POST 请求返回 200（实际请求）
     - 响应头包含 `Access-Control-Allow-Origin`

## 📋 Railway 环境变量检查清单

确保以下变量已设置：

- [ ] `DATABASE_URL` - 数据库连接字符串
- [ ] `SECRET_KEY` - 应用密钥
- [ ] `APP_ENV` = `production`
- [ ] `DEBUG` = `False`
- [ ] `CORS_ORIGINS` = `https://ai-qa-generator.vercel.app`
- [ ] `PYTHON_VERSION` = `3.11`（如果还没设置）

## 🔍 常见问题

### 问题 1: CORS_ORIGINS 格式错误

**错误格式：**
```
CORS_ORIGINS=https://ai-qa-generator.vercel.app,  （末尾有空格或逗号）
```

**正确格式：**
```
CORS_ORIGINS=https://ai-qa-generator.vercel.app
```

### 问题 2: 多个域名

如果需要支持多个域名，用逗号分隔：
```
CORS_ORIGINS=https://ai-qa-generator.vercel.app,https://another-domain.com
```

### 问题 3: 环境变量未生效

**解决：**
- 确认变量名正确：`CORS_ORIGINS`（大写）
- 添加变量后必须重新部署后端
- 检查后端日志确认配置已加载

## ✅ 成功标志

配置成功后：
- ✅ OPTIONS 预检请求返回 200
- ✅ POST 请求返回 200
- ✅ 响应头包含 `Access-Control-Allow-Origin`
- ✅ 前端可以正常生成问答对
- ✅ 浏览器控制台没有 CORS 错误

## 🆘 如果还是不行

1. **检查后端日志**
   - Railway Dashboard → Deployments → 查看日志
   - 确认应用启动时加载的 CORS 配置

2. **测试后端 API**
   ```bash
   curl -X POST https://web-production-ac7f.up.railway.app/api/v1/generator/generate \
     -H "Content-Type: application/json" \
     -H "Origin: https://ai-qa-generator.vercel.app" \
     -d '{"category":"通用知识","count":1,"style":"专业"}'
   ```

3. **检查浏览器 Network 标签**
   - 查看 OPTIONS 请求的响应头
   - 确认 `Access-Control-Allow-Origin` 是否存在

