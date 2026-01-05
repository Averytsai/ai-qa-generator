# 数据库连接问题分析

## 🔍 问题根源

### 错误信息
```
Cannot find module 'pg'
Require stack:
- /var/task/api/utils/db.js
```

### 问题分析

**Vercel运行时找不到`pg`模块**

可能的原因：
1. **`api/node_modules`没有被包含在部署中**
   - `.vercelignore`可能排除了`node_modules`
   - Vercel可能没有正确打包`api/node_modules`

2. **依赖安装位置问题**
   - `npm install`可能安装到了错误的位置
   - Vercel可能没有在`api/`目录下安装依赖

3. **Vercel Functions的依赖打包问题**
   - Vercel Serverless Functions需要显式包含依赖
   - 可能需要特殊配置

## 🔧 解决方案

### 方案1：检查.vercelignore
- 确保`api/node_modules`没有被忽略
- Vercel需要包含`api/node_modules`才能找到`pg`模块

### 方案2：检查installCommand
- 确保`cd api && npm install`正确执行
- 确保依赖安装到`api/node_modules`

### 方案3：使用Vercel的依赖打包
- Vercel应该自动检测并打包`api/package.json`的依赖
- 但可能需要确保`api/node_modules`存在

## 📋 检查清单

- [ ] `.vercelignore`是否排除了`api/node_modules`
- [ ] `installCommand`是否正确安装依赖
- [ ] `api/node_modules/pg`是否存在
- [ ] Vercel构建日志中是否有依赖安装错误

