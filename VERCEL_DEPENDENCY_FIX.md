# Vercel依赖打包问题

## 问题
Vercel运行时找不到`pg`模块：`Cannot find module '/var/task/api/node_modules/pg/lib/index.js'`

## 可能的原因
1. Vercel没有正确打包`api/node_modules`
2. 依赖安装位置不正确
3. Vercel的依赖打包机制需要特殊配置

## 解决方案

### 方案1：确保api/package.json存在且正确
- ✅ 已确认存在
- ✅ 依赖已正确声明

### 方案2：使用动态导入
- 尝试使用`require()`而不是`import`
- 或者使用动态`import()`

### 方案3：检查Vercel构建日志
- 确认`api/node_modules`是否被正确安装
- 确认依赖是否被正确打包

### 方案4：使用Vercel的依赖打包
- Vercel应该自动检测`api/package.json`
- 但可能需要确保构建过程正确

## 下一步
1. 检查Vercel构建日志
2. 尝试使用动态导入
3. 或者将依赖移到根目录的package.json

