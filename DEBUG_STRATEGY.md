# Bug诊断策略

## 🔍 问题分析

所有API返回500错误，包括不需要数据库的`/api/categories`。

## 💡 诊断假设

### 假设A：TypeScript编译错误
- Vercel构建时TypeScript检查失败
- 函数代码未正确编译

### 假设B：模块导入失败
- `@vercel/node`在运行时找不到
- `pg`模块未正确安装

### 假设C：导入路径问题
- `.js`扩展名导致运行时错误
- 相对路径解析失败

### 假设D：运行时错误
- 函数执行时抛出未捕获异常
- 环境变量缺失导致崩溃

### 假设E：模块加载顺序问题
- `db.ts`在模块加载时出错
- 即使不导入db的函数也受影响

## 🔧 诊断方法

### 方法1：检查Vercel Function Logs（最直接）

1. **访问Vercel Dashboard**
   - 登录 https://vercel.com/dashboard
   - 选择项目

2. **查看Function Logs**
   - Deployments → 最新部署
   - Functions → 点击 `/api/categories`
   - 查看 **Logs** 标签

3. **查看构建日志**
   - Deployments → 最新部署
   - 查看 **Build Logs**

### 方法2：本地测试（如果可能）

```bash
# 安装依赖
cd api && npm install

# 检查TypeScript编译
npx tsc --noEmit

# 检查模块导入
node -e "require('./categories.ts')"
```

### 方法3：简化函数测试

创建一个最简单的函数来测试：
- 不导入任何模块
- 只返回静态数据
- 检查是否能正常运行

## 📋 检查清单

- [ ] 查看Vercel Function Logs
- [ ] 查看构建日志
- [ ] 检查环境变量（DATABASE_URL）
- [ ] 检查package.json依赖
- [ ] 检查TypeScript配置
- [ ] 测试最简单的函数

## 🎯 下一步

1. **立即检查Vercel Function Logs** - 这是最关键的
2. 根据日志中的错误信息进行修复
3. 如果日志不可用，创建最简单的测试函数

