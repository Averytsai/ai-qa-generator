# 修复500错误

## 问题原因

前端显示 "Request failed with status code 500" 是因为后端代码使用了Pydantic v1的语法，但项目使用的是Pydantic v2.5.0。

## 已修复的问题

### 1. `app/api/v1/generator.py`
- ❌ 旧代码: `QAPairResponse.from_orm(qa_pair)` (Pydantic v1)
- ✅ 新代码: `QAPairResponse.model_validate(qa_pair)` (Pydantic v2)

- ❌ 旧代码: `qa_pair.dict()` (Pydantic v1)
- ✅ 新代码: `qa_pair.model_dump()` (Pydantic v2)

### 2. `app/api/v1/feedback.py`
- ❌ 旧代码: `QAPairResponse.from_orm(qa_pair)` (Pydantic v1)
- ✅ 新代码: `QAPairResponse.model_validate(qa_pair)` (Pydantic v2)

## 验证修复

后端API现在可以正常工作：
```bash
curl -X POST http://localhost:8000/api/v1/generator/generate \
  -H "Content-Type: application/json" \
  -d '{"category":"通用知识","count":1,"style":"专业"}'
```

## 下一步

1. **重启后端服务器**（如果使用了--reload，应该会自动重新加载）
   ```bash
   # 如果服务器没有自动重新加载，需要手动重启
   # 停止当前服务器 (Ctrl+C)
   # 然后重新启动
   uvicorn app.main:app --reload
   ```

2. **刷新前端页面**（硬刷新：Ctrl+Shift+R 或 Cmd+Shift+R）

3. **再次测试生成功能**

## 如果问题仍然存在

1. 检查后端服务器日志，查看具体错误信息
2. 确认后端服务器已重新加载最新代码
3. 检查浏览器控制台的网络请求详情

