# Vercel构建TypeScript错误修复说明

## 问题

Vercel构建时出现TypeScript错误：
- `Cannot find module '@vercel/node'`
- `typescript` missing from devDependencies

## 原因

Vercel在构建时，TypeScript类型检查可能在依赖安装之前运行，导致找不到模块。

## 已实施的修复

### 1. 将TypeScript移到dependencies
- 将`typescript`、`@types/node`、`@types/pg`从`devDependencies`移到`dependencies`
- 确保Vercel构建时能访问这些包

### 2. 添加installCommand
- 在`vercel.json`中添加`installCommand`
- 确保在构建前先安装所有依赖

### 3. 创建.vercelignore
- 排除不需要部署的文件
- 减少构建时间

## 如果问题仍然存在

### 方案1：在Vercel Dashboard配置

1. 登录 Vercel Dashboard
2. 选择项目 → **Settings** → **Build & Development Settings**
3. 设置 **Install Command**：
   ```
   cd api && npm install --production=false && cd ../frontend && npm install
   ```
4. 设置 **Build Command**：
   ```
   cd frontend && npm run build
   ```

### 方案2：创建根级别package.json

如果上述方法不行，可以创建根级别的`package.json`来统一管理依赖：

```json
{
  "name": "qa-generator",
  "private": true,
  "workspaces": [
    "api",
    "frontend"
  ],
  "scripts": {
    "install:all": "cd api && npm install && cd ../frontend && npm install"
  }
}
```

### 方案3：禁用TypeScript检查（不推荐）

如果以上方法都不行，可以在`api/tsconfig.json`中设置：
```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

## 验证

部署后，检查构建日志：
1. 应该看到 `Installing dependencies...`
2. 应该看到 `api/node_modules` 被安装
3. TypeScript错误应该消失

## 当前配置

- `api/package.json`: 所有依赖在dependencies中
- `vercel.json`: 包含installCommand和buildCommand
- `.vercelignore`: 排除不需要的文件

