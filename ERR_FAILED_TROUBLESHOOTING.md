# ERR_FAILED 错误排查指南

## 🔴 错误：net::ERR_FAILED

这个错误通常表示网络请求完全失败，可能的原因：

1. **后端服务未运行**
2. **Railway 服务出现问题**
3. **网络连接问题**
4. **SSL/HTTPS 证书问题**

## ✅ 排查步骤

### 步骤 1: 检查 Railway 后端服务状态

1. **登录 Railway Dashboard**
   - https://railway.app/dashboard

2. **检查服务状态**
   - 选择你的后端服务
   - 查看服务状态：
     - ✅ "Active" = 服务正在运行
     - ❌ "Inactive" 或 "Crashed" = 服务未运行

3. **查看部署状态**
   - Deployments → 查看最新部署
   - 状态应该是 "Active"
   - 如果显示 "Failed" 或 "Crashed"，查看日志

### 步骤 2: 查看后端日志

1. **在 Railway Dashboard**
   - Deployments → 点击最新部署
   - 查看 "Logs" 标签

2. **检查错误信息**
   - 查找错误或异常
   - 确认应用是否正常启动
   - 应该看到：`應用程式啟動: AI問答集生成系統`

### 步骤 3: 测试后端健康检查

在浏览器或终端中访问：

```
https://web-production-ac7f.up.railway.app/health
```

**应该返回：**
```json
{
  "status": "healthy",
  "environment": "production"
}
```

**如果无法访问：**
- 后端服务可能未运行
- Railway 服务可能有问题
- 需要检查 Railway Dashboard

### 步骤 4: 测试后端 API 文档

访问：

```
https://web-production-ac7f.up.railway.app/docs
```

**应该看到：** FastAPI 的 Swagger 文档页面

**如果无法访问：**
- 确认后端服务正在运行
- 检查 Railway 服务状态

### 步骤 5: 直接测试 API 端点

在终端运行：

```bash
curl -X POST https://web-production-ac7f.up.railway.app/api/v1/generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "category": "通用知识",
    "count": 1,
    "style": "专业"
  }'
```

**如果返回错误：**
- 查看具体错误信息
- 检查后端日志

**如果连接超时或失败：**
- Railway 服务可能未运行
- 需要重启服务

## 🔧 常见问题和解决方案

### 问题 1: 服务未运行

**症状：**
- Railway Dashboard 显示服务 "Inactive" 或 "Crashed"
- 无法访问健康检查端点

**解决方案：**
1. Railway Dashboard → Deployments
2. 点击 "Redeploy"
3. 等待部署完成
4. 检查日志确认服务启动成功

### 问题 2: 服务崩溃

**症状：**
- Railway Dashboard 显示 "Crashed"
- 日志中有错误信息

**解决方案：**
1. 查看日志找出错误原因
2. 常见原因：
   - 环境变量缺失（DATABASE_URL, SECRET_KEY）
   - 数据库连接失败
   - 应用启动错误
3. 修复问题后重新部署

### 问题 3: 数据库连接失败

**症状：**
- 日志显示数据库连接错误
- 应用无法启动

**解决方案：**
1. 检查 `DATABASE_URL` 环境变量
2. 确认数据库服务正在运行
3. 测试数据库连接

### 问题 4: 端口配置问题

**症状：**
- 服务显示运行但无法访问

**解决方案：**
1. 确认 Dockerfile 或 Procfile 正确配置
2. 确认使用 `$PORT` 环境变量
3. Railway 会自动设置 PORT

## 📋 检查清单

- [ ] Railway 服务状态是 "Active"
- [ ] 最新部署状态是 "Active"
- [ ] 后端日志显示应用已启动
- [ ] `/health` 端点可以访问
- [ ] `/docs` 端点可以访问
- [ ] 环境变量都已设置
- [ ] 数据库服务正在运行

## 🆘 快速修复

### 如果服务未运行：

1. **Railway Dashboard → Deployments**
2. **点击 "Redeploy"**
3. **等待部署完成**
4. **检查日志确认启动成功**

### 如果服务崩溃：

1. **查看日志找出错误**
2. **检查环境变量**
3. **修复问题**
4. **重新部署**

## 💡 调试技巧

### 1. 检查服务状态

在 Railway Dashboard 中：
- 服务列表显示状态
- 绿色 = 运行中
- 红色 = 停止或错误

### 2. 查看实时日志

Railway Dashboard → Deployments → 最新部署 → Logs：
- 查看实时日志
- 查找错误信息
- 确认请求是否到达后端

### 3. 测试端点

使用 curl 或浏览器直接测试：
- `/health` - 健康检查
- `/docs` - API 文档
- `/api/v1/generator/generate` - 实际 API

## ✅ 成功标志

修复成功后：
- ✅ Railway 服务状态显示 "Active"
- ✅ `/health` 端点返回正常
- ✅ `/docs` 端点可以访问
- ✅ 前端可以正常发送请求
- ✅ 浏览器 Network 标签显示请求成功

