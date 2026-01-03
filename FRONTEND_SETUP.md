# 前端设置和使用指南

## ✅ 前端已创建完成

前端项目已创建在 `frontend/` 目录，包含以下功能：

### 已实现的功能页面

1. **生成问答页面** (`/generate`)
   - 选择知识领域
   - 设置生成参数
   - 查看生成结果
   - 查看生成历史

2. **审查管理页面** (`/review`)
   - 查看所有问答对
   - 单个审查
   - 批量审查
   - 查看审查结果和评分

3. **审核反馈页面** (`/feedback`)
   - 查看待审核列表
   - 提交审核反馈（通过/修改/拒绝）
   - 填写反馈原因

4. **知识库页面** (`/knowledge`)
   - 查看已通过的问答对
   - 按分类筛选
   - 搜索功能

5. **统计分析页面** (`/analytics`)
   - 总体统计
   - 分类统计
   - 数据可视化

## 🚀 启动前端

### 方式1: 使用npm（推荐）

```bash
cd frontend
npm install  # 如果还没安装依赖
npm run dev
```

前端将在 http://localhost:3000 启动

### 方式2: 使用yarn

```bash
cd frontend
yarn install
yarn dev
```

## 🔗 API连接

前端已配置好API连接：

- **开发环境**: 自动代理 `/api` 到 `http://localhost:8000`
- **API基础URL**: `/api/v1`
- **所有API端点**: 已实现并连接

## 📋 功能说明

### 1. 生成问答

访问 http://localhost:3000/generate

- 选择知识领域（5大分类）
- 设置生成数量（1-100）
- 可选：输入主题关键词
- 选择生成风格（专业/通俗/详细）
- 点击"生成问答对"
- 查看生成结果和历史记录

### 2. 审查管理

访问 http://localhost:3000/review

- 查看所有问答对列表
- 选择问答对进行审查
- 查看审查结果（多维度评分）
- 支持批量审查

### 3. 审核反馈

访问 http://localhost:3000/feedback

- 查看待审核列表
- 选择操作：通过/修改/拒绝
- 如果选择修改，可以编辑问题和答案
- 填写反馈分类和原因
- 提交反馈

### 4. 知识库

访问 http://localhost:3000/knowledge

- 查看所有已通过的问答对
- 按分类筛选
- 搜索问题和答案
- 展开查看详细信息

### 5. 统计分析

访问 http://localhost:3000/analytics

- 查看总体统计（总数、待审核、已通过、已拒绝）
- 查看平均评分
- 查看各分类统计

## 🎨 UI特性

- **响应式设计**: 适配不同屏幕尺寸
- **Ant Design组件**: 现代化的UI组件
- **中文界面**: 完全中文化
- **实时更新**: 操作后自动刷新数据
- **错误处理**: 友好的错误提示

## 🔧 开发说明

### 项目结构

```
frontend/
├── src/
│   ├── components/     # 公共组件
│   │   └── AppLayout.tsx
│   ├── pages/         # 页面组件
│   │   ├── GeneratePage.tsx
│   │   ├── ReviewPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   ├── KnowledgeBasePage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── services/       # API服务
│   │   └── api.ts
│   ├── types/          # TypeScript类型
│   │   └── index.ts
│   ├── App.tsx         # 主应用组件
│   └── main.tsx        # 入口文件
├── package.json
└── vite.config.ts
```

### API服务

所有API调用都在 `src/services/api.ts` 中：

- `categoryApi` - 分类相关API
- `generatorApi` - 生成相关API
- `reviewerApi` - 审查相关API
- `feedbackApi` - 反馈相关API

### 类型定义

所有TypeScript类型定义在 `src/types/index.ts` 中

## 🐛 常见问题

### 问题1: 前端无法连接后端

**解决**:
1. 确认后端服务器运行在 http://localhost:8000
2. 检查 `vite.config.ts` 中的代理配置
3. 查看浏览器控制台的错误信息

### 问题2: API调用失败

**解决**:
1. 检查后端服务器是否正常运行
2. 查看网络请求（浏览器开发者工具）
3. 检查API响应格式是否正确

### 问题3: 页面空白

**解决**:
1. 查看浏览器控制台错误
2. 确认所有依赖已安装：`npm install`
3. 检查TypeScript编译错误

## 📝 下一步

1. **启动后端服务器**（如果还没启动）:
   ```bash
   uvicorn app.main:app --reload
   ```

2. **启动前端服务器**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **访问前端界面**:
   http://localhost:3000

4. **开始使用**:
   - 生成问答对
   - 审查问答对
   - 提交反馈
   - 查看知识库

---

**前端已完全配置好，所有API已连接！** 🎉

