# Vercel Functions 配置说明

## ✅ 正确的配置方式

Vercel **自动识别** `api/` 目录下的文件为 Serverless Functions，**不需要**在 `vercel.json` 中显式配置 `functions`。

### 自动识别规则
- `api/*.ts` → `/api/*`
- `api/*.js` → `/api/*`
- `api/**/*.ts` → `/api/**/*`
- `api/**/*.js` → `/api/**/*`

### 示例
```
api/
  ├── categories.ts      → /api/categories
  ├── qa-pairs.ts       → /api/qa-pairs
  ├── test-basic.js     → /api/test-basic
  └── utils/
      └── db.ts         → 不会被识别为独立函数（工具文件）
```

## ❌ 错误的配置

### 错误1：在functions中指定runtime版本
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"  // ❌ 错误：需要版本号
    }
  }
}
```

**错误信息：**
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

### 错误2：不需要显式配置functions
Vercel 会自动识别 `api/` 目录，不需要手动配置。

## ✅ 正确的vercel.json配置

```json
{
  "buildCommand": "cd api && npm install && cd ../frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd api && npm install && cd ../frontend && npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🔍 为什么TypeScript文件不工作？

### 可能的原因
1. **TypeScript编译错误**
   - 检查 `api/tsconfig.json` 配置
   - 检查构建日志中的TypeScript错误

2. **模块导入问题**
   - `@vercel/node` 未正确安装
   - 相对导入路径问题（`.js`扩展名）

3. **函数导出格式问题**
   - 必须使用 `export default async function handler(req, res)`
   - 必须导入正确的类型

## 📋 检查清单

- [ ] `api/` 目录存在
- [ ] `api/package.json` 包含 `@vercel/node` 依赖
- [ ] `api/tsconfig.json` 配置正确
- [ ] 函数使用正确的导出格式
- [ ] 构建日志中没有TypeScript错误

## 💡 下一步

1. **等待部署完成**
2. **查看构建日志**
   - 检查TypeScript编译是否成功
   - 检查是否有函数构建错误
3. **测试API**
   ```bash
   curl "https://ai-qa-generator.vercel.app/api/categories"
   ```

