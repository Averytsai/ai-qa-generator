# Vercel 部署问题排查指南

## 🔍 当前问题：网站打不开

### 第一步：检查 Vercel Dashboard

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 找到你的项目 `ai-qa-generator`

2. **检查部署状态**
   - 查看最新的部署记录
   - 检查是否有构建错误（红色标记）
   - 查看构建日志

### 第二步：检查项目设置

在 Vercel Dashboard → Settings → General：

**必须检查的设置：**

1. **Root Directory** ⚠️ **最重要！**
   - 必须设置为：`frontend`
   - 如果设置为 `/` 或其他，会导致找不到 `vercel.json`

2. **Framework Preset**
   - 应该自动识别为：`Vite`
   - 如果没有，手动选择 `Vite`

3. **Build Command**
   - 应该显示：`npm run build`
   - 或者：`cd frontend && npm run build`（如果 Root Directory 不是 frontend）

4. **Output Directory**
   - 应该显示：`dist`
   - 或者：`frontend/dist`（如果 Root Directory 不是 frontend）

5. **Install Command**
   - 应该显示：`npm install`
   - 或者：`cd frontend && npm install`

### 第三步：检查构建日志

在部署详情页面，查看构建日志，常见错误：

#### 错误 1: 找不到 vercel.json
```
Error: Could not find vercel.json
```
**解决方案：** Root Directory 必须设置为 `frontend`

#### 错误 2: 构建失败
```
Error: Command "npm run build" exited with 1
```
**解决方案：** 
- 检查 TypeScript 错误
- 检查依赖是否正确安装
- 查看详细错误信息

#### 错误 3: 找不到模块
```
Error: Cannot find module 'xxx'
```
**解决方案：** 
- 确保 `package.json` 中有所有依赖
- 运行 `npm install` 确保依赖完整

### 第四步：重新部署

如果设置有问题：

1. **修改 Root Directory**
   - Settings → General → Root Directory
   - 改为：`frontend`
   - 保存

2. **触发重新部署**
   - 方法 1: 推送新的 commit 到 GitHub
   - 方法 2: 在 Deployments 页面点击 "Redeploy"

### 第五步：验证配置

确认以下文件存在且正确：

✅ `frontend/vercel.json` - 存在
✅ `frontend/package.json` - 存在
✅ `frontend/vite.config.ts` - 存在
✅ `frontend/src/App.tsx` - 存在

## 🛠️ 快速修复步骤

### 如果 Root Directory 设置错误：

1. 登录 Vercel Dashboard
2. 进入项目设置
3. Settings → General → Root Directory
4. 设置为：`frontend`
5. 保存
6. 重新部署

### 如果构建失败：

1. 查看构建日志中的具体错误
2. 在本地测试构建：
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. 修复本地构建错误
4. 提交并推送修复

## 📋 检查清单

- [ ] Root Directory 设置为 `frontend`
- [ ] `frontend/vercel.json` 文件存在
- [ ] `frontend/vercel.json` 已提交到 Git
- [ ] 构建命令正确：`npm run build`
- [ ] 输出目录正确：`dist`
- [ ] 本地构建成功：`cd frontend && npm run build`
- [ ] 没有 TypeScript 错误
- [ ] 所有依赖已安装

## 🔗 有用的链接

- Vercel Dashboard: https://vercel.com/dashboard
- 项目设置: https://vercel.com/[your-username]/ai-qa-generator/settings
- 部署日志: https://vercel.com/[your-username]/ai-qa-generator/deployments

## 💡 常见问题

### Q: 为什么设置了 Root Directory 还是不行？
A: 确保保存设置后，重新部署项目。修改设置不会自动触发重新部署。

### Q: 如何查看详细的构建日志？
A: 在 Deployments 页面，点击失败的部署，查看 "Build Logs" 标签。

### Q: 本地构建成功，但 Vercel 构建失败？
A: 检查 Node.js 版本是否一致。Vercel 默认使用 Node.js 18.x。

