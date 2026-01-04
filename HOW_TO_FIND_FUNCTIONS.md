# 如何在Vercel Dashboard中找到Functions

## 📍 查找Functions的步骤

### 方法1：通过Deployments页面
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目（`ai-qa-generator`）
3. 点击 **Deployments** 标签
4. 点击**最新的部署**（最上面的那个）
5. 在部署详情页面，你应该能看到：
   - **Overview** 标签
   - **Functions** 标签 ← 点击这里
   - **Build Logs** 标签
   - **Source** 标签

### 方法2：如果看不到Functions标签
如果看不到Functions标签，可能的原因：
1. **API函数没有被识别**
   - Vercel可能没有识别到`api/`目录下的函数
   - 需要检查`vercel.json`配置

2. **部署还在进行中**
   - 等待部署完成
   - 刷新页面

3. **查看Build Logs**
   - 点击 **Build Logs** 标签
   - 查看是否有TypeScript编译错误
   - 查看是否有函数构建错误

## 🔍 检查构建日志

### 查看Build Logs
1. Deployments → 最新部署
2. 点击 **Build Logs** 标签
3. 查找以下内容：
   - TypeScript编译错误
   - `@vercel/node`相关错误
   - 函数构建错误
   - 依赖安装错误

### 查找的关键词
- `error`
- `TypeScript`
- `@vercel/node`
- `FUNCTION`
- `api/`

## 💡 如果找不到Functions

### 可能的原因
1. **API函数没有被正确识别**
   - Vercel默认只识别`api/`目录下的文件
   - TypeScript文件可能需要特殊配置

2. **构建失败**
   - TypeScript编译错误
   - 依赖安装失败

3. **部署配置问题**
   - `vercel.json`配置不正确
   - 函数路径配置错误

## 🔧 解决方案

### 方案1：检查vercel.json配置
确保`vercel.json`中有正确的配置：
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"
    },
    "api/**/*.js": {
      "runtime": "@vercel/node"
    }
  }
}
```

### 方案2：查看构建日志
即使找不到Functions标签，也可以：
1. 查看 **Build Logs** 获取错误信息
2. 查看 **Overview** 标签查看部署状态
3. 检查部署是否成功

### 方案3：使用Vercel CLI
如果Dashboard看不到，可以使用CLI：
```bash
vercel logs
```

## 📋 下一步

1. **先查看Build Logs**
   - 这是最重要的，可以看到所有错误信息
   - 告诉我Build Logs中有什么错误

2. **检查部署状态**
   - 部署是否成功？
   - 是否有错误提示？

3. **告诉我你看到了什么**
   - Build Logs中有什么错误？
   - 部署状态是什么？

