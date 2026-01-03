# 调试指南 - 生成问答对按钮失败

## 问题排查步骤

### 1. 打开浏览器开发者工具
- 按 `F12` 或右键点击页面 → "检查"
- 切换到 **Console** 标签

### 2. 点击"生成問答對"按钮

### 3. 查看控制台输出

应该看到以下日志：
```
开始生成，参数： {category: "通用知识", count: 1, ...}
发送请求数据： {category: "通用知识", count: 1, ...}
API请求： POST /api/v1/generator/generate {...}
```

### 4. 检查错误信息

如果失败，会看到：
- **API响应错误：** - 后端返回的错误
- **生成失败：** - 前端捕获的错误

### 5. 检查网络请求

1. 切换到 **Network** 标签
2. 点击"生成問答對"按钮
3. 找到 `generator/generate` 请求
4. 查看：
   - **Status**: 应该是 200（成功）或 4xx/5xx（错误）
   - **Request Payload**: 检查发送的数据
   - **Response**: 查看返回的数据或错误信息

### 6. 常见错误和解决方案

#### 错误1: 分类值不匹配
**错误信息**: `Input should be '通用知识', '技术流程'...`

**原因**: 前端发送的分类值与后端期望的不一致

**解决**: 确保使用正确的分类值：
- "通用知识" (不是"通用知識")
- "技术流程"
- "故障排除"
- "资安法规"
- "应用案例"

#### 错误2: 网络连接失败
**错误信息**: `Network Error` 或 `Failed to fetch`

**原因**: 
- 后端服务器未运行
- CORS配置问题
- 网络连接问题

**解决**:
1. 确认后端运行在 http://localhost:8000
2. 检查后端健康状态: `curl http://localhost:8000/health`
3. 检查浏览器控制台的CORS错误

#### 错误3: 表单验证失败
**错误信息**: `請檢查表單輸入是否正確`

**原因**: 表单字段验证未通过

**解决**:
- 确保选择了"知識領域"
- 确保"生成數量"在1-100之间
- 检查是否有必填字段未填写

#### 错误4: API Key问题
**错误信息**: `401 Unauthorized` 或 `Incorrect API key`

**原因**: OpenAI API Key未配置或无效

**解决**:
1. 检查 `.env` 文件中的 `OPENAI_API_KEY`
2. 确认API Key有效
3. 重启后端服务器

### 7. 手动测试API

在终端运行：
```bash
curl -X POST http://localhost:8000/api/v1/generator/generate \
  -H "Content-Type: application/json" \
  -d '{"category":"通用知识","count":1,"style":"专业"}'
```

如果这个命令成功，说明后端API正常，问题在前端。

### 8. 检查前端代码

确认：
1. `frontend/src/types/index.ts` 中的 `QACategory` 枚举值正确
2. `frontend/src/pages/GeneratePage.tsx` 中的表单提交逻辑正确
3. `frontend/src/services/api.ts` 中的API调用正确

## 快速修复

如果所有检查都正常，尝试：

1. **硬刷新页面**: `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
2. **清除浏览器缓存**
3. **重启前端服务器**:
   ```bash
   cd frontend
   npm run dev
   ```
4. **重启后端服务器**

## 需要帮助？

如果问题仍然存在，请提供：
1. 浏览器控制台的完整错误信息
2. Network标签中的请求详情（Request和Response）
3. 后端服务器的日志输出

