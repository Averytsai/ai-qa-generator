# 🚀 Vercel 全栈部署迁移指南

## 📋 概述

将前后端全部迁移到 Vercel，使用 Vercel Serverless Functions 替代后端服务器。

## ✅ 已完成的工作

### 1. 创建 Vercel Serverless Functions

- ✅ `/api/generate.ts` - 生成问答对（调用 OpenAI API）
- ✅ `/api/review.ts` - 审查问答对（调用 OpenAI API）
- ✅ `/api/categories.ts` - 获取分类（静态数据）

### 2. 更新前端 API 调用

- ✅ 更新 `frontend/src/services/api.ts`，指向 Vercel Functions
- ✅ 历史记录和反馈使用 localStorage 存储（前端实现）

### 3. 更新 Vercel 配置

- ✅ 更新 `frontend/vercel.json`，配置 API routes

## 📁 新的项目结构

```
项目根目录/
├── api/                          # Vercel Serverless Functions
│   ├── generate.ts               # 生成问答对
│   ├── review.ts                 # 审查问答对
│   ├── categories.ts             # 获取分类
│   └── package.json              # API 依赖
├── frontend/                      # React 前端
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts            # API 客户端（已更新）
│   │   └── ...
│   └── vercel.json               # Vercel 配置（已更新）
└── vercel.json                    # 根目录 Vercel 配置（可选）
```

## 🔧 部署步骤

### 步骤 1: 安装 API 依赖

在项目根目录创建 `package.json`（如果还没有）：

```bash
cd api
npm install
```

### 步骤 2: 设置环境变量

在 Vercel Dashboard 中设置以下环境变量：

1. **OPENAI_API_KEY** - 你的 OpenAI API Key
   - 值：`sk-proj-...`（你的 API Key）

### 步骤 3: 更新 Vercel 项目配置

在 Vercel Dashboard 中：

1. 进入项目设置
2. **Build & Development Settings**：
   - **Root Directory**: 留空（使用项目根目录）
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd api && npm install && cd ../frontend && npm install`

### 步骤 4: 部署

1. 推送代码到 GitHub
2. Vercel 会自动检测并部署
3. 等待部署完成

## 🔍 API 端点说明

### POST `/api/generate`

生成问答对。

**请求体：**
```json
{
  "category": "通用知識",
  "count": 3,
  "topic": "H200SXM相關",
  "style": "專業"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "qa_pairs": [
      {
        "id": "qa-1234567890-0",
        "question": "问题内容",
        "answer": "答案内容",
        "category": "通用知識",
        "topic": "H200SXM相關",
        "style": "專業",
        "status": "pending",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### POST `/api/review`

审查问答对。

**请求体：**
```json
{
  "qa_pair_id": "qa-1234567890-0",
  "question": "问题内容",
  "answer": "答案内容"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "qa_pair_id": "qa-1234567890-0",
    "reviewer_score": 85,
    "scores": {
      "accuracy": 90,
      "completeness": 85,
      "relevance": 80,
      "language_quality": 85,
      "domain_fit": 85
    },
    "suggestions": ["建议1", "建议2"],
    "passed": true,
    "reviewed_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/categories`

获取所有分类。

**响应：**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "通用知識",
        "name": "通用知識",
        "description": "基礎概念、常識性內容",
        "qa_count": 0
      }
    ]
  }
}
```

## 💾 前端数据存储

### localStorage 键名

- `qa_history` - 问答对历史记录
- `qa_feedback` - 反馈记录

### 数据结构

**qa_history:**
```json
[
  {
    "id": "qa-1234567890-0",
    "question": "问题内容",
    "answer": "答案内容",
    "category": "通用知識",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🔄 迁移检查清单

- [ ] 创建 `/api` 目录和 Functions
- [ ] 安装 API 依赖（`cd api && npm install`）
- [ ] 更新前端 API 调用
- [ ] 更新 Vercel 配置
- [ ] 在 Vercel Dashboard 设置 `OPENAI_API_KEY`
- [ ] 测试生成功能
- [ ] 测试审查功能
- [ ] 测试分类获取
- [ ] 测试历史记录（localStorage）
- [ ] 测试反馈提交（localStorage）

## ⚠️ 注意事项

1. **环境变量**：确保在 Vercel Dashboard 中设置了 `OPENAI_API_KEY`
2. **API 路由**：Vercel Functions 必须放在 `/api` 目录下
3. **数据持久化**：历史记录和反馈使用 localStorage，刷新页面会保留，但清除浏览器数据会丢失
4. **CORS**：API Functions 已经配置了 CORS，允许所有来源

## 🆘 故障排除

### 问题 1: API 返回 404

**原因：** API Functions 路径不正确

**解决：**
- 确认 API Functions 在 `/api` 目录下
- 确认 Vercel 配置正确

### 问题 2: OpenAI API Key 错误

**原因：** 环境变量未设置或格式错误

**解决：**
- 在 Vercel Dashboard 中检查 `OPENAI_API_KEY`
- 确认 API Key 格式正确（以 `sk-` 开头）

### 问题 3: 前端无法调用 API

**原因：** API 路径配置错误

**解决：**
- 检查 `frontend/src/services/api.ts` 中的 `API_BASE_URL`
- 确认开发环境使用 `/api`，生产环境也使用 `/api`

## 📝 下一步

1. 测试所有功能
2. 优化错误处理
3. 添加加载状态
4. 优化用户体验

