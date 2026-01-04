# 🔴 502 错误诊断和修复指南

## 📋 错误信息

```
{"status":"error","code":502,"message":"Application failed to respond"}
```

## 🔍 错误原因分析

### 502 错误的含义

**502 Bad Gateway** 表示：
- ✅ Railway 服务器正常运行
- ❌ 后端应用没有响应
- ❌ 后端应用可能崩溃或无法启动

### 可能的原因

#### 1. 应用启动失败 ⚠️ 最可能

**检查：** Railway 部署日志

**常见原因：**
- 环境变量缺失（`SECRET_KEY`, `DATABASE_URL`）
- 数据库连接失败
- Python 模块导入错误
- 端口配置错误

#### 2. 应用启动后崩溃

**检查：** Railway 运行时日志

**常见原因：**
- 数据库连接超时
- 内存不足
- 未捕获的异常导致进程退出

#### 3. 应用无法响应请求

**检查：** 应用是否监听正确的端口

**常见原因：**
- 端口配置错误
- 应用监听错误的地址（应该是 `0.0.0.0`）

## ✅ 诊断步骤

### 步骤 1: 检查 Railway 部署日志

1. 登录 Railway Dashboard
2. 选择后端服务
3. 点击 **"Deployments"** 标签
4. 点击最新的部署
5. 查看 **"Build Logs"** 和 **"Deploy Logs"**

**应该看到：**
- ✅ 构建成功
- ✅ 依赖安装成功
- ✅ `python run.py` 启动成功
- ✅ 应用启动日志

**不应该看到：**
- ❌ `ValidationError`
- ❌ `Field required`
- ❌ `Connection refused`
- ❌ `No module named`

### 步骤 2: 检查 Railway 运行时日志

1. 在同一个部署页面
2. 查看 **"Logs"** 标签（实时日志）

**应该看到：**
- ✅ `應用程式啟動: AI問答集生成系統`
- ✅ `環境: production`
- ✅ `INFO:     Uvicorn running on http://0.0.0.0:PORT`

**不应该看到：**
- ❌ `Traceback`
- ❌ `Error`
- ❌ `Exception`
- ❌ 应用退出

### 步骤 3: 检查环境变量

1. 选择后端服务
2. 点击 **"Settings"** → **"Variables"**

**确认以下变量存在：**
- [ ] `DATABASE_URL` - 数据库连接字符串
- [ ] `SECRET_KEY` - 密钥
- [ ] `APP_ENV` - `production`
- [ ] `DEBUG` - `False`
- [ ] `CORS_ORIGINS` - 前端域名

### 步骤 4: 测试健康检查端点

```bash
curl https://web-production-ac7f.up.railway.app/health
```

**应该返回：**
```json
{"status":"healthy","environment":"production"}
```

**如果返回 502：**
- 应用没有运行
- 需要检查日志

## 🔧 修复方案

### 修复 1: 修复硬编码路径问题

**问题：** `app/main.py` 中有硬编码的本地路径，在 Railway 上会失败

**位置：** `app/main.py` 第 51, 57, 64, 75, 88, 100 行

**修复：** 移除或修复这些硬编码路径

### 修复 2: 添加启动时数据库连接检查

**问题：** 如果数据库连接失败，应用可能无法正常启动

**修复：** 在启动时检查数据库连接，但不阻止应用启动

### 修复 3: 改进错误处理

**问题：** 未捕获的异常可能导致应用崩溃

**修复：** 添加更好的错误处理和日志记录

## 📋 立即检查清单

- [ ] 检查 Railway 部署日志（Build Logs）
- [ ] 检查 Railway 运行时日志（Deploy Logs）
- [ ] 确认环境变量已设置
- [ ] 测试 `/health` 端点
- [ ] 检查应用是否监听 `0.0.0.0:PORT`
- [ ] 检查数据库连接是否正常

## 🆘 如果还是不行

请提供：
1. Railway 部署日志（Build Logs）的最后 50 行
2. Railway 运行时日志（Deploy Logs）的最后 50 行
3. 环境变量列表（隐藏敏感信息）
4. `/health` 端点的响应

