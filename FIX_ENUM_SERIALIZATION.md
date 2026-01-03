# 修复枚举序列化问题

## 问题原因

Pydantic v2的 `model_dump()` 默认情况下不会将枚举对象转换为字符串值，而是保留为枚举对象。这会导致JSON序列化失败，从而返回500错误。

## 解决方案

使用 `model_dump(mode='json')` 来确保枚举值正确转换为字符串。

### 修复前
```python
qa_pair_dicts = [qa_pair.model_dump() for qa_pair in qa_pair_responses]
# category 和 status 仍然是枚举对象，无法JSON序列化
```

### 修复后
```python
qa_pair_dicts = [qa_pair.model_dump(mode='json') for qa_pair in qa_pair_responses]
# category 和 status 正确转换为字符串值
```

## 验证

测试显示 `mode='json'` 可以正确转换：
- `category`: `<enum 'QACategory'>` → `'通用知识'` (字符串)
- `status`: `<enum 'QAStatus'>` → `'待审查'` (字符串)
- UUID和datetime也会正确序列化

## 已修复的文件

- `app/api/v1/generator.py` - 生成API端点

## 下一步

后端服务器应该会自动重新加载（如果使用了 `--reload`）。如果没有，请重启后端服务器。

然后刷新前端页面（硬刷新：Ctrl+Shift+R），再次测试生成功能。

