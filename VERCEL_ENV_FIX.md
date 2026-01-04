# Vercel 环境变量修复指南

## 🔴 问题

错误信息显示：
```
"baseURL": "https//web-production-ac7f.up.railway.app/api/v1"
```

**问题：** URL 缺少冒号，应该是 `https://` 而不是 `https//`

这导致请求被发送到错误的地址，返回 405 错误。

## ✅ 解决方案

### 步骤 1: 检查 Vercel 环境变量

1. **登录 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **进入项目设置**
   - 选择项目：`ai-qa-generator`
   - Settings → Environment Variables

3. **检查 `VITE_API_BASE_URL`**
   - 找到 `VITE_API_BASE_URL` 环境变量
   - **当前值可能是：** `https//web-production-ac7f.up.railway.app/api/v1`
   - **应该是：** `https://web-production-ac7f.up.railway.app/api/v1`
   - 注意：`https://` 有两个斜杠

### 步骤 2: 修复环境变量

1. **编辑环境变量**
   - 点击 `VITE_API_BASE_URL` 旁边的编辑按钮
   - 确保值格式正确：
     ```
     https://web-production-ac7f.up.railway.app/api/v1
     ```
   - **必须包含：**
     - `https://`（注意是 `://` 不是 `//`）
     - 完整的 Railway 域名
     - `/api/v1` 后缀

2. **保存**
   - 点击 "Save"

### 步骤 3: 重新部署前端

1. **在 Vercel Dashboard**
   - Deployments → 点击最新部署
   - 点击 "Redeploy"
   - 等待部署完成（1-2 分钟）

### 步骤 4: 验证修复

1. **访问前端**
   - https://ai-qa-generator.vercel.app

2. **打开浏览器开发者工具**
   - 按 F12
   - Network 标签

3. **测试生成功能**
   - 点击"生成問答對"
   - 查看 Network 标签中的请求
   - **Request URL 应该是：**
     ```
     https://web-production-ac7f.up.railway.app/api/v1/generator/generate
     ```
   - **不应该看到：** `https//`（缺少冒号）

## 📋 正确的环境变量格式

### Vercel 环境变量

```
VITE_API_BASE_URL=https://web-production-ac7f.up.railway.app/api/v1
```

**格式要求：**
- ✅ `https://`（注意是 `://`）
- ✅ 完整的 Railway 域名
- ✅ `/api/v1` 后缀
- ❌ 不要有空格
- ❌ 不要缺少冒号

## 🔍 常见错误格式

### 错误 1: 缺少冒号
```
https//web-production-ac7f.up.railway.app/api/v1  ❌
https://web-production-ac7f.up.railway.app/api/v1  ✅
```

### 错误 2: 缺少协议
```
web-production-ac7f.up.railway.app/api/v1  ❌
https://web-production-ac7f.up.railway.app/api/v1  ✅
```

### 错误 3: 缺少路径
```
https://web-production-ac7f.up.railway.app  ❌
https://web-production-ac7f.up.railway.app/api/v1  ✅
```

### 错误 4: 多余的空格
```
https://web-production-ac7f.up.railway.app/api/v1   ❌（末尾有空格）
https://web-production-ac7f.up.railway.app/api/v1  ✅
```

## ✅ 验证清单

- [ ] `VITE_API_BASE_URL` 值以 `https://` 开头
- [ ] URL 包含完整的 Railway 域名
- [ ] URL 以 `/api/v1` 结尾
- [ ] 没有多余的空格
- [ ] 已保存环境变量
- [ ] 已重新部署前端
- [ ] 浏览器 Network 标签显示正确的请求 URL

## 🆘 如果还是不行

1. **清除浏览器缓存**
   - 按 Ctrl+Shift+Delete（Windows）或 Cmd+Shift+Delete（Mac）
   - 清除缓存和 Cookie

2. **硬刷新页面**
   - 按 Ctrl+F5（Windows）或 Cmd+Shift+R（Mac）

3. **检查浏览器控制台**
   - 查看是否有其他错误信息
   - 确认 `baseURL` 值是否正确

