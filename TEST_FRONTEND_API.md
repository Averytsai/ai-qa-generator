# 测试前端API调用

## 后端API已修复并正常工作 ✅

后端API测试成功，返回正确的JSON格式。

## 请执行以下步骤

### 1. 硬刷新前端页面
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 2. 打开浏览器开发者工具
- 按 `F12` 打开开发者工具
- 切换到 **Network** 标签
- 勾选 "Preserve log"（保留日志）

### 3. 测试生成功能
1. 填写表单：
   - 选择"知識領域"：通用知识
   - 输入"生成數量"：1
   - （可选）输入"主題關鍵詞"
   - 选择"生成風格"：專業

2. 点击"生成問答對"按钮

3. 在Network标签中找到 `generator/generate` 请求

4. 点击该请求，查看：
   - **Request Payload**（请求数据）
   - **Response**（响应数据）
   - **Status Code**（状态码）

### 4. 检查请求格式

请求应该是：
```json
{
  "category": "通用知识",
  "count": 1,
  "style": "专业",
  "topic": ""  // 可选
}
```

### 5. 如果还是500错误

请告诉我：
1. **Request Payload** 的内容
2. **Response** 的内容
3. **Status Code** 是什么
4. **Console** 标签中的错误信息

## 快速测试后端API

在终端运行：
```bash
curl -X POST http://localhost:8000/api/v1/generator/generate \
  -H "Content-Type: application/json" \
  -d '{"category":"通用知识","count":1,"style":"专业"}'
```

如果这个命令成功，说明后端正常，问题在前端。

