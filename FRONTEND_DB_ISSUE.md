# 前端获取数据库失败问题诊断

## 🔍 可能的原因

### 1. Vercel环境变量未设置

**检查方法**：
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 → **Settings** → **Environment Variables**
3. 确认是否有以下环境变量：
   - `DATABASE_URL=postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable`
   - `OPENAI_API_KEY=sk-...`

**如果没有设置**：
- 添加环境变量
- 重新部署应用

### 2. API路由问题

**检查方法**：
打开浏览器开发者工具（F12），查看：
- **Network**标签：查看API请求是否发送
- **Console**标签：查看错误信息

**常见错误**：
- `404 Not Found`：API路由不存在
- `500 Internal Server Error`：服务器错误（可能是数据库连接失败）
- `CORS error`：跨域问题

### 3. 数据库连接问题

**检查方法**：
查看Vercel Function Logs：
1. Vercel Dashboard → **Deployments**
2. 点击最新部署
3. **Functions** → 点击 `/api/history`
4. 查看 **Logs**

**常见错误**：
- `DATABASE_URL 环境变量未设置`
- `Connection terminated unexpectedly`
- `timeout expired`

### 4. 状态值不匹配

前端查询时使用：`status: QAStatus.APPROVED`（值为"已通過"）

**检查数据库中的状态值**：
```sql
SELECT DISTINCT status FROM qa_pairs;
```

应该包含：`已通過`

## 🔧 解决步骤

### 步骤1：检查Vercel环境变量

```bash
# 在Vercel Dashboard中确认环境变量已设置
DATABASE_URL=postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable
```

### 步骤2：检查浏览器控制台

打开前端页面，按F12打开开发者工具：
1. 查看 **Console** 标签的错误信息
2. 查看 **Network** 标签的API请求
3. 检查API请求的URL和响应

### 步骤3：检查Vercel Function Logs

查看 `/api/history` 函数的日志：
- 是否有数据库连接错误
- 是否有SQL查询错误
- 是否有其他错误信息

### 步骤4：测试API端点

直接访问API端点测试：
```
https://your-app.vercel.app/api/history?status=已通過
```

应该返回JSON格式的数据。

## 📋 调试信息

前端已添加详细的日志输出：
- `console.log('知識庫API響應：', response)` - API响应
- `console.error('獲取知識庫失敗：', error)` - 错误信息
- `console.log('getHistory API響應：', response)` - API调用响应

## ✅ 快速检查清单

- [ ] Vercel环境变量 `DATABASE_URL` 已设置
- [ ] Vercel环境变量 `OPENAI_API_KEY` 已设置
- [ ] 已重新部署Vercel应用
- [ ] 浏览器控制台没有CORS错误
- [ ] API请求返回200状态码
- [ ] Vercel Function Logs没有数据库连接错误

## 🧪 测试命令

### 测试数据库连接
```bash
cd database
DATABASE_URL="postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable" node test_connection.js
```

### 测试API端点（本地）
```bash
# 需要先设置环境变量
export DATABASE_URL="postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable"

# 然后测试API
curl "http://localhost:3000/api/history?status=已通過"
```

### 测试API端点（Vercel）
```bash
curl "https://your-app.vercel.app/api/history?status=已通過"
```

## 📝 如果问题仍然存在

请提供以下信息：
1. 浏览器控制台的错误信息
2. Network标签中API请求的详细信息（URL、状态码、响应）
3. Vercel Function Logs中的错误信息
4. 是否有数据在数据库中（status='已通過'的记录）

