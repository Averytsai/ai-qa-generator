# Vercel 环境变量设置指南

## 必需的环境变量

在 Vercel Dashboard 中必须设置以下环境变量：

### 1. DATABASE_URL（数据库连接）

**设置步骤：**
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 点击 **Add New**
5. 填写：
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable`
   - **注意**：使用端口25329，SSL模式设为disable（因为使用自签名证书）
   - **Environment**: 选择所有环境（Production, Preview, Development）
6. 点击 **Save**

**验证：**
- 部署后，检查 Vercel Function Logs
- 如果看到 "❌ DATABASE_URL 环境变量未设置！" 说明未设置成功
- 如果看到数据库连接错误，检查连接字符串是否正确

### 2. OPENAI_API_KEY（OpenAI API密钥）

**设置步骤：**
1. 在 Vercel Dashboard 中，进入 **Settings** → **Environment Variables**
2. 点击 **Add New**
3. 填写：
   - **Name**: `OPENAI_API_KEY`
   - **Value**: 您的 OpenAI API Key（格式：`sk-...`）
   - **Environment**: 选择所有环境
4. 点击 **Save**

**获取 OpenAI API Key：**
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录您的账户
3. 创建新的 API Key
4. 复制 Key（只显示一次，请妥善保存）

## 验证环境变量

### 方法1：检查 Vercel Function Logs

1. 在 Vercel Dashboard 中，进入 **Deployments**
2. 点击最新的部署
3. 进入 **Functions** 标签
4. 点击任意 Function（如 `/api/history`）
5. 查看 **Logs**，应该看到：
   - ✅ 如果设置正确：正常的数据库查询日志
   - ❌ 如果未设置：错误信息会明确说明缺少哪个环境变量

### 方法2：测试 API

**测试数据库连接：**
```bash
curl https://your-app.vercel.app/api/history
```

**测试 OpenAI API：**
```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"category":"通用知識","count":1}'
```

## 常见错误

### 错误1：获取知识库失败

**可能原因：**
- `DATABASE_URL` 未设置
- `DATABASE_URL` 格式错误
- 数据库服务器无法访问（防火墙限制）

**解决方法：**
1. 检查 Vercel 环境变量中是否有 `DATABASE_URL`
2. 验证连接字符串格式是否正确
3. 检查数据库服务器防火墙是否允许 Vercel IP 访问

### 错误2：无法调用 OpenAI API

**可能原因：**
- `OPENAI_API_KEY` 未设置
- `OPENAI_API_KEY` 无效或已过期
- API Key 权限不足

**解决方法：**
1. 检查 Vercel 环境变量中是否有 `OPENAI_API_KEY`
2. 验证 API Key 是否有效（在 OpenAI Platform 测试）
3. 确保 API Key 有足够的额度

### 错误3：数据库连接超时

**可能原因：**
- 数据库服务器防火墙阻止了 Vercel IP
- 网络连接问题

**解决方法：**
1. 在数据库服务器上配置防火墙，允许 Vercel IP 访问
2. 或使用 SSH 隧道（如果防火墙限制严格）

## 重新部署

设置环境变量后，需要重新部署：

1. 在 Vercel Dashboard 中，进入 **Deployments**
2. 点击最新的部署右侧的 **...** 菜单
3. 选择 **Redeploy**
4. 等待部署完成

或者推送新的代码到 GitHub，Vercel 会自动部署。

## 环境变量格式

### DATABASE_URL
```
postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]?sslmode=require
```

示例：
```
postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable

**注意**：
- 主机：`tw-07.access.glows.ai`
- 端口：`25329`
- 用户名：`postgres`
- 密码：`1234`
- 数据库：`qa_generator_db`
- SSL模式：`disable`（因为使用自签名证书）
```

### OPENAI_API_KEY
```
sk-[您的API密钥]
```

## 安全提示

1. **不要**在代码中硬编码 API Key
2. **不要**将 `.env` 文件提交到 Git
3. 定期轮换 API Key
4. 使用不同的 API Key 用于不同环境（开发/生产）

