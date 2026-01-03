# API 接口设计规范

本文档定义了前后端交互的API接口规范。前端开发可以基于此文档并行开发。

## 基础信息

- **Base URL**: `http://localhost:8000/api/v1`
- **认证方式**: 暂定（后续可添加JWT）
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  }
}
```

## API 端点列表

### 1. 问答生成 API

#### 1.1 生成问答对
**POST** `/api/v1/generator/generate`

**请求体**:
```json
{
  "category": "通用知识",  // 必填: 通用知识 | 技术流程 | 故障排除 | 资安法规 | 应用案例
  "count": 5,              // 必填: 生成数量 (1-100)
  "topic": "Python编程",   // 可选: 主题关键词
  "style": "专业"          // 可选: 专业 | 通俗 | 详细
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "qa_pairs": [
      {
        "id": "uuid",
        "question": "问题文本",
        "answer": "答案文本",
        "category": "通用知识",
        "status": "待审查",
        "generator_score": 85,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 5,
    "generation_time": 3.5
  }
}
```

#### 1.2 获取生成历史
**GET** `/api/v1/generator/history`

**查询参数**:
- `category`: 知识领域（可选）
- `status`: 状态（可选）
- `page`: 页码（默认1）
- `page_size`: 每页数量（默认20）

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}
```

### 2. 问答审查 API

#### 2.1 提交审查
**POST** `/api/v1/reviewer/review`

**请求体**:
```json
{
  "qa_pair_id": "uuid"  // 必填: 问答对ID
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "qa_pair_id": "uuid",
    "reviewer_score": 78,
    "scores": {
      "accuracy": 85,
      "completeness": 80,
      "relevance": 75,
      "language_quality": 82,
      "domain_fit": 70
    },
    "suggestions": [
      "答案可以更详细",
      "建议添加示例"
    ],
    "passed": true,
    "reviewed_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 2.2 批量审查
**POST** `/api/v1/reviewer/batch-review`

**请求体**:
```json
{
  "qa_pair_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "qa_pair_id": "uuid1",
        "reviewer_score": 78,
        "passed": true
      }
    ],
    "summary": {
      "total": 3,
      "passed": 2,
      "failed": 1
    }
  }
}
```

### 3. 人工审核反馈 API

#### 3.1 提交审核反馈
**POST** `/api/v1/feedback/submit`

**请求体**:
```json
{
  "qa_pair_id": "uuid",
  "action": "approve",  // approve | modify | reject
  "modified_question": "修改后的问题",  // 如果action=modify
  "modified_answer": "修改后的答案",    // 如果action=modify
  "feedback_categories": ["准确性", "完整性"],  // 反馈分类
  "review_reason": "答案不够详细，需要补充示例"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "feedback_id": "uuid",
    "qa_pair_id": "uuid",
    "status": "已通过",
    "submitted_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 3.2 获取待审核列表
**GET** `/api/v1/feedback/pending`

**查询参数**:
- `category`: 知识领域（可选）
- `page`: 页码
- `page_size`: 每页数量

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "question": "问题",
        "answer": "答案",
        "category": "通用知识",
        "generator_score": 85,
        "reviewer_score": 78,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 20
  }
}
```

### 4. 分类管理 API

#### 4.1 获取所有分类
**GET** `/api/v1/categories`

**响应**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "general",
        "name": "通用知识",
        "description": "基础概念、常识性内容",
        "qa_count": 150
      },
      {
        "id": "technical",
        "name": "技术流程",
        "description": "技术规范、操作流程",
        "qa_count": 200
      }
    ]
  }
}
```

#### 4.2 获取分类统计
**GET** `/api/v1/categories/{category_id}/stats`

**响应**:
```json
{
  "success": true,
  "data": {
    "category": "通用知识",
    "total_qa": 150,
    "pending_review": 20,
    "approved": 100,
    "rejected": 30,
    "average_score": 82.5
  }
}
```

### 5. 提示词模板管理 API

#### 5.1 获取模板列表
**GET** `/api/v1/prompts/templates`

**查询参数**:
- `category`: 知识领域（可选）

**响应**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "category": "通用知识",
        "name": "基础模板",
        "version": "1.0",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 5.2 获取模板内容
**GET** `/api/v1/prompts/templates/{template_id}`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "通用知识",
    "name": "基础模板",
    "content": "模板内容...",
    "version": "1.0",
    "parameters": {
      "max_length": 500,
      "style": "专业"
    }
  }
}
```

### 6. 统计分析 API

#### 6.1 获取仪表板数据
**GET** `/api/v1/analytics/dashboard`

**响应**:
```json
{
  "success": true,
  "data": {
    "total_qa": 1000,
    "pending_review": 50,
    "approved": 800,
    "rejected": 150,
    "average_score": 82.5,
    "by_category": {
      "通用知识": 200,
      "技术流程": 300,
      "故障排除": 250,
      "资安法规": 150,
      "应用案例": 100
    },
    "recent_activity": [
      {
        "date": "2024-01-01",
        "generated": 50,
        "reviewed": 30,
        "approved": 25
      }
    ]
  }
}
```

## 错误码定义

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| `VALIDATION_ERROR` | 400 | 请求参数验证失败 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `GENERATION_ERROR` | 500 | 生成失败 |
| `REVIEW_ERROR` | 500 | 审查失败 |
| `DATABASE_ERROR` | 500 | 数据库错误 |
| `AI_MODEL_ERROR` | 500 | AI模型服务错误 |

## 前端页面需求

基于以上API，前端需要以下页面：

1. **问答生成页面**
   - 选择知识领域
   - 设置生成参数
   - 显示生成结果
   - 查看生成历史

2. **审查页面**
   - 显示待审查列表
   - 显示审查结果和评分
   - 批量审查功能

3. **审核反馈页面**
   - 显示待审核列表
   - 审核操作（通过/修改/拒绝）
   - 填写反馈原因

4. **知识库管理页面**
   - 查看已审核通过的问答
   - 按分类筛选
   - 搜索功能

5. **统计分析页面**
   - 仪表板数据展示
   - 各分类统计
   - 趋势图表

6. **模板管理页面**（可选）
   - 查看提示词模板
   - 模板版本管理

