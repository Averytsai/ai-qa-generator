# Railway 服务未运行修复指南

## 🔴 问题：后端服务无法访问

健康检查端点 `https://web-production-ac7f.up.railway.app/health` 无法访问，说明后端服务未运行或已崩溃。

## ✅ 立即操作步骤

### 步骤 1: 检查 Railway 服务状态

1. **登录 Railway Dashboard**
   - https://railway.app/dashboard

2. **查看服务列表**
   - 找到你的后端服务（不是数据库服务）
   - 查看服务状态：
     - 🟢 "Active" = 运行中
     - 🔴 "Inactive" = 未运行
     - 🔴 "Crashed" = 崩溃

### 步骤 2: 查看部署日志

1. **进入后端服务**
   - 点击后端服务

2. **查看 Deployments**
   - 点击 "Deployments" 标签
   - 查看最新部署的状态

3. **查看日志**
   - 点击最新部署
   - 查看 "Logs" 标签
   - **查找错误信息**，常见错误：
     - `Field required` - 环境变量缺失
     - `Database connection failed` - 数据库连接失败
     - `Module not found` - 依赖问题
     - `Port already in use` - 端口冲突

### 步骤 3: 检查环境变量

1. **Settings → Variables**
2. **确认以下必需变量存在：**
   - ✅ `DATABASE_URL`
   - ✅ `SECRET_KEY`
   - ✅ `APP_ENV` = `production`
   - ✅ `DEBUG` = `False`
   - ✅ `CORS_ORIGINS` = `https://ai-qa-generator.vercel.app`

### 步骤 4: 重新部署服务

1. **方法 1: 重新部署（推荐）**
   - Deployments → 点击最新部署
   - 点击 "Redeploy"
   - 等待部署完成

2. **方法 2: 触发新部署**
   - 推送新的 commit 到 GitHub
   - Railway 会自动检测并部署

### 步骤 5: 验证服务启动

部署完成后：

1. **查看日志**
   - 应该看到：`應用程式啟動: AI問答集生成系統`
   - 应该看到：`環境: production`
   - **不应该看到**：错误或异常

2. **测试健康检查**
   - 访问：`https://web-production-ac7f.up.railway.app/health`
   - 应该返回：`{"status":"healthy","environment":"production"}`

3. **测试 API 文档**
   - 访问：`https://web-production-ac7f.up.railway.app/docs`
   - 应该看到 FastAPI Swagger 文档

## 🔧 常见问题和解决方案

### 问题 1: 环境变量缺失

**错误信息：** `Field required` 或 `ValidationError`

**解决方案：**
1. Settings → Variables
2. 添加缺失的环境变量
3. 重新部署

### 问题 2: 数据库连接失败

**错误信息：** `Database connection failed` 或 `could not connect to server`

**解决方案：**
1. 检查 `DATABASE_URL` 是否正确
2. 确认数据库服务正在运行
3. 测试数据库连接

### 问题 3: 应用启动错误

**错误信息：** `Module not found` 或 `ImportError`

**解决方案：**
1. 检查 `requirements.txt` 是否完整
2. 确认所有依赖都已安装
3. 查看构建日志

### 问题 4: 端口配置问题

**错误信息：** `Port already in use` 或服务无法启动

**解决方案：**
1. 确认 Dockerfile 或 Procfile 使用 `$PORT`
2. Railway 会自动设置 PORT 环境变量
3. 不需要手动指定端口

## 📋 检查清单

- [ ] Railway 服务状态是 "Active"
- [ ] 所有必需环境变量都已设置
- [ ] 数据库服务正在运行
- [ ] 部署日志没有错误
- [ ] `/health` 端点可以访问
- [ ] `/docs` 端点可以访问

## 🆘 如果重新部署后还是不行

### 检查 1: 查看详细日志

Railway Dashboard → Deployments → 最新部署 → Logs：
- 复制完整的错误信息
- 查找具体的错误原因

### 检查 2: 验证环境变量

Settings → Variables：
- 确认所有变量名正确（大小写）
- 确认值格式正确（没有多余空格）
- 确认值完整（没有截断）

### 检查 3: 测试数据库连接

如果数据库连接失败：
1. 检查数据库服务状态
2. 确认 `DATABASE_URL` 格式正确
3. 测试数据库连接

## 💡 快速修复命令

如果需要手动触发重新部署：

1. **在 Railway Dashboard**
   - Deployments → Redeploy

2. **或者推送代码**
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

## ✅ 成功标志

修复成功后：
- ✅ Railway 服务状态显示 "Active"
- ✅ 部署日志显示应用已启动
- ✅ `/health` 端点返回正常
- ✅ `/docs` 端点可以访问
- ✅ 前端可以正常连接后端

