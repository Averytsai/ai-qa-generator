# API 调用指南

## 🎯 三种调用方式

### 方式1: 使用 FastAPI 自动文档（最简单，推荐）⭐

这是最简单的方式，不需要任何工具，直接在浏览器中操作。

#### 步骤：

1. **打开浏览器**，访问：http://localhost:8000/docs

2. **找到要调用的API**，例如：
   - `GET /api/v1/categories` - 获取分类列表
   - `POST /api/v1/generator/generate` - 生成问答对

3. **点击API端点**展开详情

4. **点击 "Try it out" 按钮**

5. **填写参数**（如果需要）：
   ```json
   {
     "category": "通用知识",
     "count": 1,
     "topic": "Python编程",
     "style": "专业"
   }
   ```

6. **点击 "Execute" 执行**

7. **查看结果**：
   - 响应状态码
   - 响应体（JSON格式）
   - 响应头

---

### 方式2: 使用 curl 命令（命令行）

适合在终端中快速测试。

#### 示例1: 获取分类列表

```bash
curl http://localhost:8000/api/v1/categories
```

#### 示例2: 生成问答对

```bash
curl -X POST "http://localhost:8000/api/v1/generator/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "通用知识",
    "count": 1,
    "topic": "Python编程",
    "style": "专业"
  }'
```

#### 示例3: 格式化输出（使用 jq）

```bash
curl http://localhost:8000/api/v1/categories | jq
```

---

### 方式3: 使用 Python requests（编程方式）

适合在Python脚本中调用API。

#### 安装 requests（如果还没有）

```bash
pip install requests
```

#### 示例代码

```python
import requests
import json

# API基础URL
BASE_URL = "http://localhost:8000/api/v1"

# 1. 获取分类列表
def get_categories():
    response = requests.get(f"{BASE_URL}/categories")
    return response.json()

# 2. 生成问答对
def generate_qa(category="通用知识", count=1, topic=None, style="专业"):
    url = f"{BASE_URL}/generator/generate"
    data = {
        "category": category,
        "count": count,
        "style": style
    }
    if topic:
        data["topic"] = topic
    
    response = requests.post(url, json=data)
    return response.json()

# 3. 审查问答对
def review_qa(qa_pair_id):
    url = f"{BASE_URL}/reviewer/review"
    data = {"qa_pair_id": qa_pair_id}
    response = requests.post(url, json=data)
    return response.json()

# 4. 提交反馈
def submit_feedback(qa_pair_id, action="approve", review_reason=None):
    url = f"{BASE_URL}/feedback/submit"
    data = {
        "qa_pair_id": qa_pair_id,
        "action": action,
        "review_reason": review_reason
    }
    response = requests.post(url, json=data)
    return response.json()

# 使用示例
if __name__ == "__main__":
    # 获取分类
    print("获取分类列表...")
    categories = get_categories()
    print(json.dumps(categories, indent=2, ensure_ascii=False))
    
    # 生成问答对
    print("\n生成问答对...")
    result = generate_qa(category="通用知识", count=1, topic="Python编程")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 获取问答对ID（从生成结果中）
    if result.get("success") and result.get("data", {}).get("qa_pairs"):
        qa_pair_id = result["data"]["qa_pairs"][0]["id"]
        
        # 审查问答对
        print("\n审查问答对...")
        review_result = review_qa(qa_pair_id)
        print(json.dumps(review_result, indent=2, ensure_ascii=False))
```

---

## 📋 完整API调用示例

### 1. 获取分类列表

**请求：**
```bash
GET /api/v1/categories
```

**响应：**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "通用知识",
        "name": "通用知识",
        "description": "基础概念、常识性内容",
        "qa_count": 0
      }
    ]
  }
}
```

---

### 2. 生成问答对

**请求：**
```bash
POST /api/v1/generator/generate
Content-Type: application/json

{
  "category": "通用知识",
  "count": 1,
  "topic": "Python编程",
  "style": "专业"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "qa_pairs": [
      {
        "id": "uuid",
        "question": "什么是Python？",
        "answer": "Python是一种高级编程语言...",
        "category": "通用知识",
        "status": "待审查",
        "generator_score": 85,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "generation_time": 3.5
  }
}
```

---

### 3. 审查问答对

**请求：**
```bash
POST /api/v1/reviewer/review
Content-Type: application/json

{
  "qa_pair_id": "uuid-from-generate-response"
}
```

**响应：**
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
    "suggestions": ["建议1", "建议2"],
    "passed": true,
    "reviewed_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 4. 提交反馈

**请求：**
```bash
POST /api/v1/feedback/submit
Content-Type: application/json

{
  "qa_pair_id": "uuid",
  "action": "approve",
  "review_reason": "答案准确完整"
}
```

**响应：**
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

---

### 5. 获取待审核列表

**请求：**
```bash
GET /api/v1/feedback/pending?page=1&page_size=20
```

**响应：**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 50,
    "page": 1,
    "page_size": 20,
    "total_pages": 3
  }
}
```

---

## 🔧 使用 Postman 或其他API工具

### Postman 设置

1. **创建新请求**
2. **设置请求方法**（GET/POST）
3. **输入URL**：`http://localhost:8000/api/v1/...`
4. **设置Headers**：
   - `Content-Type: application/json`
5. **设置Body**（POST请求）：
   - 选择 "raw"
   - 选择 "JSON"
   - 输入JSON数据

### 导入OpenAPI规范

FastAPI自动生成OpenAPI规范，可以导入到Postman：

1. 访问：http://localhost:8000/openapi.json
2. 复制JSON内容
3. 在Postman中：Import → Raw Text → 粘贴JSON

---

## 🐛 常见问题

### 问题1: 连接被拒绝

**错误：** `Connection refused`

**解决：**
- 确认服务器正在运行：`curl http://localhost:8000/health`
- 检查端口8000是否被占用

### 问题2: 404 Not Found

**错误：** `404 Not Found`

**解决：**
- 检查URL是否正确
- 确认API路径：`/api/v1/...`

### 问题3: 422 Validation Error

**错误：** `422 Unprocessable Entity`

**解决：**
- 检查请求参数格式
- 确认必填字段已填写
- 检查数据类型是否正确

### 问题4: 500 Internal Server Error

**错误：** `500 Internal Server Error`

**解决：**
- 查看服务器日志：`tail -f logs/app.log`
- 检查数据库连接
- 确认AI API Key配置正确

---

## 📝 完整工作流程示例

### 步骤1: 获取分类列表
```bash
curl http://localhost:8000/api/v1/categories
```

### 步骤2: 生成问答对
```bash
curl -X POST "http://localhost:8000/api/v1/generator/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "通用知识",
    "count": 1,
    "topic": "Python编程",
    "style": "专业"
  }'
```

### 步骤3: 从响应中获取qa_pair_id，然后审查
```bash
curl -X POST "http://localhost:8000/api/v1/reviewer/review" \
  -H "Content-Type: application/json" \
  -d '{
    "qa_pair_id": "从步骤2获取的ID"
  }'
```

### 步骤4: 提交反馈
```bash
curl -X POST "http://localhost:8000/api/v1/feedback/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "qa_pair_id": "从步骤2获取的ID",
    "action": "approve",
    "review_reason": "答案准确完整"
  }'
```

---

## 💡 推荐方式

**对于初学者：** 使用 FastAPI 自动文档（http://localhost:8000/docs）
- 无需安装任何工具
- 可视化界面
- 自动验证参数
- 直接查看响应

**对于开发者：** 使用 Python requests
- 可以编写脚本自动化
- 易于集成到项目中
- 可以处理复杂逻辑

**对于快速测试：** 使用 curl
- 命令行快速测试
- 适合CI/CD流程
- 轻量级

---

**现在就去试试吧！** 🚀

访问 http://localhost:8000/docs 开始使用！

