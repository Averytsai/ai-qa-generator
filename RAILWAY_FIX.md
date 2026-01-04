# Railway 部署问题修复

## 🔴 问题：pydantic-core 构建失败

**错误原因：**
- `pydantic==2.5.0` 不兼容 Python 3.13
- Railway 默认使用 Python 3.13

## ✅ 解决方案

### 方案 1: 指定 Python 版本为 3.11（推荐）

在 Railway 项目设置中：

1. **进入项目设置**
   - Settings → Variables
   - 添加环境变量：
     ```
     PYTHON_VERSION=3.11
     ```

2. **或者使用 runtime.txt**（已创建）
   - Railway 会自动读取 `runtime.txt`
   - 文件内容：`python-3.11.9`

### 方案 2: 升级依赖版本（已更新）

已更新 `requirements.txt`：
- `pydantic>=2.9.0`（支持 Python 3.13）
- `pydantic-settings>=2.6.0`

## 🚀 重新部署步骤

1. **如果使用方案 1（推荐）**
   - 在 Railway Dashboard → Settings → Variables
   - 添加：`PYTHON_VERSION=3.11`
   - 保存设置
   - 重新部署

2. **如果使用方案 2**
   - 代码已更新并推送
   - Railway 会自动检测并重新部署
   - 等待构建完成

## 📋 Railway 配置检查清单

- [ ] Python 版本设置为 3.11（在环境变量中）
- [ ] 或者确认 `runtime.txt` 文件存在
- [ ] `Procfile` 存在且正确
- [ ] `requirements.txt` 已更新
- [ ] 数据库已创建并连接
- [ ] 环境变量已配置（DATABASE_URL, API Keys 等）

## 🔍 验证部署

部署成功后，检查：

1. **构建日志**
   - 应该看到：`Successfully installed pydantic...`
   - 不应该有 `pydantic-core` 构建错误

2. **应用启动**
   - 检查日志中是否有：`應用程式啟動`
   - 访问：`https://your-app.up.railway.app/health`
   - 应该返回：`{"status":"healthy"}`

## 🆘 如果仍然失败

1. **检查 Python 版本**
   - 在 Railway Dashboard → Deployments → 查看构建日志
   - 确认 Python 版本是 3.11 或 3.12

2. **手动指定 Python 版本**
   - Settings → Variables
   - 添加：`PYTHON_VERSION=3.11`
   - 重新部署

3. **检查依赖冲突**
   - 查看构建日志中的错误信息
   - 可能需要进一步调整依赖版本

