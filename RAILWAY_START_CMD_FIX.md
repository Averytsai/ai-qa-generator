# Railway 启动命令修复指南

## 🔴 问题

日志中仍然显示 `$PORT` 错误，说明 Railway 可能还在使用旧的启动命令。

## ✅ 解决方案：在 Railway Dashboard 中手动设置启动命令

### 步骤 1: 登录 Railway Dashboard

访问：https://railway.app/dashboard

### 步骤 2: 进入后端服务设置

1. 选择你的项目
2. 点击后端服务（不是数据库服务）
3. 点击 "Settings" 标签

### 步骤 3: 设置启动命令

1. **找到 "Start Command" 或 "Deploy" 设置**
   - 在 Settings 页面中查找
   - 可能在 "Service" 或 "Deploy" 部分

2. **设置启动命令**
   - 如果看到启动命令字段，设置为：`python run.py`
   - 如果看到 "Start Command"，设置为：`python run.py`
   - 如果看到 "Command"，设置为：`python run.py`

3. **保存设置**
   - 点击 "Save" 或设置会自动保存

### 步骤 4: 检查其他可能的位置

如果找不到启动命令设置，检查：

1. **Settings → Service**
   - 查看是否有 "Start Command" 或 "Command" 字段

2. **Settings → Deploy**
   - 查看部署相关设置

3. **Settings → Variables**
   - 确认没有 `START_COMMAND` 或其他相关环境变量

### 步骤 5: 重新部署

1. **Deployments → 点击最新部署**
2. **点击 "Redeploy"**
3. **等待部署完成**

### 步骤 6: 验证修复

部署成功后，检查日志：

**应该看到：**
- `Starting uvicorn on port XXXX`（数字，不是 $PORT）
- `應用程式啟動: AI問答集生成系統`
- 没有 `Invalid value for '--port'` 错误

**不应该看到：**
- `Error: Invalid value for '--port': '$PORT'`
- `$PORT` 字面字符串

## 📋 当前配置状态

### 已配置的文件：

✅ `run.py` - Python 启动脚本（正确）
✅ `Procfile` - `web: python run.py`（正确）
✅ `nixpacks.toml` - `cmd = "python run.py"`（正确）
✅ `railway.json` - `startCommand: "python run.py"`（正确）
✅ `start.sh` - 已删除（避免冲突）

### Railway Dashboard 设置：

需要在 Railway Dashboard 中确认：
- [ ] Start Command 设置为：`python run.py`
- [ ] 没有其他启动命令配置
- [ ] 已重新部署

## 🔍 如果 Railway Dashboard 中没有启动命令设置

Railway 应该会自动使用以下优先级：
1. `railway.json` 中的 `startCommand`
2. `Procfile` 中的命令
3. `nixpacks.toml` 中的 `[start] cmd`

如果还是不行，可能需要：
1. 删除 Railway 项目并重新创建
2. 或者联系 Railway 支持

## 🆘 最后的解决方案

如果所有方法都失败，可以在 Railway Dashboard → Settings → Variables 中添加：

- **Name:** `RAILWAY_START_COMMAND`
- **Value:** `python run.py`

然后重新部署。

## ✅ 验证清单

- [ ] `start.sh` 已删除
- [ ] `run.py` 存在且可执行
- [ ] `Procfile` 使用 `python run.py`
- [ ] `nixpacks.toml` 使用 `python run.py`
- [ ] `railway.json` 指定了 `startCommand`
- [ ] Railway Dashboard 中启动命令正确
- [ ] 已重新部署
- [ ] 日志中没有 PORT 错误

