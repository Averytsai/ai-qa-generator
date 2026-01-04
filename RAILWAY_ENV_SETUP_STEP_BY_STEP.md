# 🚨 Railway 环境变量设置 - 详细步骤

## ⚠️ 当前错误

```
ValidationError: 2 validation errors for Settings
secret_key - Field required
database_url - Field required
```

**原因：** Railway 后端服务**还没有设置**必需的环境变量。

## ✅ 必须立即执行的操作

### 步骤 1: 登录 Railway Dashboard

1. 打开浏览器
2. 访问：**https://railway.app/dashboard**
3. 使用你的账号登录

### 步骤 2: 找到后端服务（重要！）

1. 在 Dashboard 中，找到你的项目
2. **点击后端服务**（不是数据库服务）
   - 后端服务通常显示为 "Web Service" 或类似名称
   - 图标可能是 🌐 或 ⚙️
   - **不要点击** PostgreSQL 数据库服务

### 步骤 3: 进入环境变量设置

1. 点击后端服务后
2. 点击顶部的 **"Settings"** 标签
3. 在 Settings 页面中，点击 **"Variables"** 标签

### 步骤 4: 添加第一个环境变量 - SECRET_KEY

1. 点击 **"New Variable"** 按钮（通常在右上角）
2. 在弹出的对话框中：
   - **Name（变量名）：** 输入 `SECRET_KEY`
   - **Value（值）：** 输入 `NAWDx21slCryTDJNRHBIkAKGoWd-QfIfyEM1Ps3vddM`
3. 点击 **"Add"** 或 **"Save"** 按钮

**验证：** 在变量列表中应该能看到 `SECRET_KEY`

### 步骤 5: 添加第二个环境变量 - DATABASE_URL

**首先，获取 DATABASE_URL：**

1. 在同一个项目中，找到 **PostgreSQL 数据库服务**
2. 点击数据库服务
3. 点击 **"Variables"** 标签
4. 找到 `DATABASE_URL` 变量
5. 点击复制按钮（或手动复制值）

**然后，添加到后端服务：**

1. 回到后端服务的 **Settings → Variables** 页面
2. 点击 **"New Variable"** 按钮
3. 在弹出的对话框中：
   - **Name（变量名）：** 输入 `DATABASE_URL`
   - **Value（值）：** 粘贴刚才复制的数据库连接字符串
4. 点击 **"Add"** 或 **"Save"** 按钮

**验证：** 在变量列表中应该能看到 `DATABASE_URL`

### 步骤 6: 添加推荐的环境变量

#### APP_ENV
- **Name:** `APP_ENV`
- **Value:** `production`

#### DEBUG
- **Name:** `DEBUG`
- **Value:** `False`

#### CORS_ORIGINS
- **Name:** `CORS_ORIGINS`
- **Value:** `https://ai-qa-generator.vercel.app`

### 步骤 7: 验证所有变量

在 Variables 列表中，确认以下变量都存在：

- [ ] `SECRET_KEY` = `NAWDx21slCryTDJNRHBIkAKGoWd-QfIfyEM1Ps3vddM`
- [ ] `DATABASE_URL` = `postgresql://...`（你的数据库连接字符串）
- [ ] `APP_ENV` = `production`
- [ ] `DEBUG` = `False`
- [ ] `CORS_ORIGINS` = `https://ai-qa-generator.vercel.app`

### 步骤 8: 重新部署（重要！）

**添加环境变量后，必须重新部署才能生效：**

1. 点击顶部的 **"Deployments"** 标签
2. 找到最新的部署（通常在最上面）
3. 点击部署右侧的 **"..."** 菜单
4. 选择 **"Redeploy"** 或 **"Restart"**
5. 等待部署完成（通常 1-2 分钟）

### 步骤 9: 检查部署日志

1. 在 Deployments 页面，点击最新的部署
2. 查看 **"Deploy Logs"** 标签

**应该看到：**
- ✅ `應用程式啟動: AI問答集生成系統`
- ✅ `環境: production`
- ✅ `資料庫連接檢查成功`
- ✅ `INFO:     Uvicorn running on http://0.0.0.0:PORT`

**不应该看到：**
- ❌ `Field required`
- ❌ `ValidationError`
- ❌ `secret_key` 或 `database_url` 错误

## 📸 截图参考

如果你不确定在哪里设置，请告诉我：
1. 你在 Railway Dashboard 中看到了什么？
2. 你能找到后端服务吗？
3. 你能看到 "Settings" → "Variables" 吗？

## 🔍 常见问题

### Q1: 我找不到后端服务

**A:** 后端服务可能显示为：
- "Web Service"
- "Backend"
- 或者显示为你的项目名称

**提示：** 如果看到多个服务，选择**不是数据库**的那个。

### Q2: 我找不到 "Settings" 标签

**A:** 
1. 确保你点击的是**后端服务**（不是数据库）
2. Settings 标签通常在顶部导航栏
3. 如果还是找不到，告诉我你看到了什么标签

### Q3: 我找不到 "Variables" 选项

**A:**
1. 确保你在 Settings 页面
2. Variables 可能在 Settings 页面的子标签中
3. 或者可能在 "Environment Variables" 部分

### Q4: 我添加了变量，但还是报错

**A:**
1. **确认变量名拼写正确**（区分大小写）
2. **确认值没有多余的空格或引号**
3. **必须重新部署**才能生效
4. 检查变量是否真的保存了（在列表中能看到）

### Q5: 我不知道 DATABASE_URL 是什么

**A:**
1. 在同一个 Railway 项目中
2. 找到 PostgreSQL 数据库服务
3. 点击数据库服务
4. 在 Variables 标签中
5. 找到 `DATABASE_URL` 并复制

## 🆘 如果还是不行

请提供：
1. **截图**：Railway Dashboard 中后端服务的 Settings → Variables 页面
2. **变量列表**：你看到的所有环境变量（隐藏敏感信息）
3. **部署日志**：最新的部署日志的最后 50 行

## ✅ 完成检查清单

- [ ] 已登录 Railway Dashboard
- [ ] 已找到后端服务（不是数据库）
- [ ] 已进入 Settings → Variables
- [ ] 已添加 `SECRET_KEY`
- [ ] 已添加 `DATABASE_URL`
- [ ] 已添加 `APP_ENV`
- [ ] 已添加 `DEBUG`
- [ ] 已添加 `CORS_ORIGINS`
- [ ] 已重新部署后端
- [ ] 部署日志显示应用启动成功
- [ ] `/health` 端点返回正常

