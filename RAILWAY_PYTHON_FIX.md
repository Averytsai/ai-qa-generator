# Railway Python 版本修复指南

## 🔴 问题

Railway 仍然在使用 Python 3.13，导致 `pydantic-core` 构建失败。

## ✅ 解决方案（已配置）

我已经创建了多个配置文件来强制使用 Python 3.11：

1. **nixpacks.toml** - Railway 的 Nixpacks 配置
2. **railway.json** - Railway 项目配置
3. **runtime.txt** - Python 版本指定

## 🚀 立即操作步骤

### 方法 1: 在 Railway Dashboard 中设置环境变量（最快）

1. **登录 Railway Dashboard**
   - https://railway.app/dashboard

2. **进入项目设置**
   - 选择你的项目
   - Settings → Variables

3. **添加环境变量**
   - 点击 "New Variable"
   - Name: `PYTHON_VERSION`
   - Value: `3.11`
   - 点击 "Add"

4. **重新部署**
   - 在 Deployments 页面
   - 点击最新的部署
   - 点击 "Redeploy"

### 方法 2: 等待自动部署（已推送代码）

代码已推送，Railway 应该会自动检测并重新部署。

如果还是失败，使用方法 1。

## 📋 验证步骤

1. **查看构建日志**
   - 在 Railway Dashboard → Deployments
   - 点击最新的部署
   - 查看构建日志
   - 应该看到：`Using Python 3.11.x` 或类似信息
   - **不应该看到**：`Python 3.13`

2. **检查 requirements.txt**
   - 构建日志中应该显示：`pydantic>=2.9.0`
   - **不应该显示**：`pydantic==2.5.0`

3. **验证安装**
   - 构建日志中应该看到：`Successfully installed pydantic...`
   - 不应该有 `pydantic-core` 构建错误

## 🔍 如果仍然失败

### 检查 1: 确认代码已更新

在 Railway Dashboard：
- Settings → Source
- 确认连接的是正确的 GitHub 仓库
- 确认分支是 `main`
- 点击 "Redeploy" 强制重新部署

### 检查 2: 清除缓存

Railway 可能缓存了旧的构建：
- 在 Deployments 页面
- 删除失败的部署
- 触发新的部署

### 检查 3: 手动指定 Python 版本

如果配置文件不工作，直接在环境变量中设置：
- `PYTHON_VERSION=3.11`

## 📝 配置文件说明

### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["python311"]  # 强制使用 Python 3.11
```

### runtime.txt
```
python-3.11
```

### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  }
}
```

## 🆘 如果所有方法都失败

最后的解决方案：在 Railway 中手动设置构建命令

1. Settings → Service
2. 找到 "Build Command"
3. 设置为：
   ```bash
   python3.11 -m pip install -r requirements.txt
   ```

4. Start Command 设置为：
   ```bash
   python3.11 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

## ✅ 成功标志

部署成功后，你应该看到：
- ✅ 构建日志显示 Python 3.11
- ✅ `pydantic` 安装成功
- ✅ 应用启动成功
- ✅ `/health` 端点返回正常

