# Vercel部署问题检查清单

## 🔍 当前状态
所有API返回500错误：`FUNCTION_INVOCATION_FAILED`

## ✅ 已完成的修复
1. ✅ 移除了所有本地fetch调用
2. ✅ 改用console.log记录日志
3. ✅ 检查了所有API文件的导入路径

## 🔍 需要检查的问题

### 1. TypeScript编译问题
- [ ] 检查Vercel构建日志中的TypeScript错误
- [ ] 确认`api/tsconfig.json`配置正确
- [ ] 确认`moduleResolution: "bundler"`设置正确

### 2. 模块导入问题
- [ ] 确认`@vercel/node`正确安装
- [ ] 确认`pg`模块正确安装
- [ ] 确认相对导入路径（`.js`扩展名）正确

### 3. 环境变量问题
- [ ] 确认`DATABASE_URL`在Vercel Dashboard中已设置
- [ ] 确认`OPENAI_API_KEY`在Vercel Dashboard中已设置

### 4. Vercel配置问题
- [ ] 确认`vercel.json`中的`installCommand`正确
- [ ] 确认`vercel.json`中的`buildCommand`正确
- [ ] 确认API路由配置正确

## 🧪 测试步骤

### 测试1：最简单的函数
```bash
curl "https://ai-qa-generator.vercel.app/api/test-simple"
```
如果这个也失败，说明是基础配置问题。

### 测试2：不需要数据库的函数
```bash
curl "https://ai-qa-generator.vercel.app/api/categories"
```
如果这个失败，说明不是数据库问题。

### 测试3：需要数据库的函数
```bash
curl "https://ai-qa-generator.vercel.app/api/qa-pairs"
```
如果这个失败，可能是数据库连接问题。

## 📋 下一步行动

1. **查看Vercel Function Logs**（最重要）
   - 登录Vercel Dashboard
   - 选择项目 → Deployments → 最新部署
   - Functions → 点击任意Function
   - 查看Logs标签

2. **查看构建日志**
   - Deployments → 最新部署
   - 查看Build Logs
   - 检查TypeScript编译错误

3. **检查环境变量**
   - Settings → Environment Variables
   - 确认所有必需的环境变量已设置

4. **测试最简单的函数**
   - 如果`/api/test-simple`也失败，说明是基础配置问题
   - 需要检查Vercel配置和TypeScript编译

## 💡 可能的原因

1. **TypeScript编译错误** - 最可能
   - Vercel在构建时TypeScript检查失败
   - 函数代码未正确编译

2. **模块导入失败** - 可能
   - `@vercel/node`在运行时找不到
   - 相对导入路径问题

3. **环境变量缺失** - 可能
   - `DATABASE_URL`未设置导致db.ts加载失败
   - 即使categories也失败，说明可能是模块加载顺序问题

4. **Vercel配置问题** - 可能
   - `installCommand`或`buildCommand`配置错误
   - API路由配置错误

