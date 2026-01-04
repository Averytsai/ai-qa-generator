# Vercel 部署检查清单

## 🔍 请按照以下步骤逐一检查

### 步骤 1: 检查 Vercel Dashboard 的部署状态

1. **访问 Vercel Dashboard**
   - 网址：https://vercel.com/dashboard
   - 登录你的账号

2. **找到项目**
   - 项目名应该是：`ai-qa-generator`
   - 点击进入项目

3. **查看最新部署**
   - 在 "Deployments" 标签页
   - 查看最新的部署状态
   - **状态是什么？**
     - ✅ "Ready" (绿色) = 部署成功
     - ⏳ "Building" (黄色) = 正在构建
     - ❌ "Error" (红色) = 构建失败

### 步骤 2: 如果构建失败，查看错误日志

1. **点击失败的部署**
2. **查看 "Build Logs"**
3. **复制错误信息**（如果有的话）

**常见错误：**
- `Error: Could not find vercel.json` → Root Directory 设置错误
- `Error: Command "npm run build" exited with 1` → TypeScript 或构建错误
- `Error: Cannot find module` → 依赖问题

### 步骤 3: 检查项目设置（最重要！）

1. **进入 Settings**
   - 在项目页面，点击 "Settings" 标签

2. **General 设置**
   - 找到 "Root Directory"
   - **当前设置是什么？**
     - ✅ 应该是：`frontend` 或留空（使用根目录）
     - ❌ 如果是其他值，需要修改

3. **Build & Development Settings**
   - Framework Preset: 应该是 `Vite` 或 `Other`
   - Build Command: 
     - 如果 Root Directory = `frontend`: 应该是 `npm run build`
     - 如果 Root Directory = 空: 应该是 `cd frontend && npm run build`
   - Output Directory:
     - 如果 Root Directory = `frontend`: 应该是 `dist`
     - 如果 Root Directory = 空: 应该是 `frontend/dist`
   - Install Command: `npm install` 或 `cd frontend && npm install`

### 步骤 4: 两种配置方案

#### 方案 A: Root Directory = `frontend`（推荐）

**设置：**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**使用的配置文件：** `frontend/vercel.json`

#### 方案 B: Root Directory = 空（根目录）

**设置：**
- Root Directory: （留空）
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`
- Install Command: `cd frontend && npm install`

**使用的配置文件：** `vercel.json`（根目录）

### 步骤 5: 修改设置后重新部署

1. **修改设置**
   - 根据上面的方案修改设置
   - 点击 "Save"

2. **触发重新部署**
   - 方法 1: 推送新的 commit（我已经推送了）
   - 方法 2: 在 Deployments 页面点击 "Redeploy"

### 步骤 6: 验证网站

部署成功后（状态显示 "Ready"），访问：
- https://ai-qa-generator.vercel.app/
- https://ai-qa-generator.vercel.app/generate
- https://ai-qa-generator.vercel.app/review

**如果还是打不开：**
1. 检查浏览器控制台（F12）的错误信息
2. 检查网络请求是否成功
3. 告诉我具体的错误信息

## 📋 快速检查清单

- [ ] 登录了 Vercel Dashboard
- [ ] 找到了项目 `ai-qa-generator`
- [ ] 查看了最新部署的状态
- [ ] 如果失败，查看了构建日志
- [ ] 检查了 Root Directory 设置
- [ ] 检查了 Build Command 设置
- [ ] 检查了 Output Directory 设置
- [ ] 修改设置后保存了
- [ ] 触发了重新部署
- [ ] 等待部署完成
- [ ] 测试了网站访问

## 🆘 如果还是不行

请告诉我：
1. **Vercel Dashboard 显示的部署状态是什么？**（Ready/Error/Building）
2. **如果有错误，错误信息是什么？**
3. **Root Directory 当前设置是什么？**
4. **浏览器访问时显示什么？**（404/500/空白页/其他错误）

这样我可以更准确地帮你解决问题！

