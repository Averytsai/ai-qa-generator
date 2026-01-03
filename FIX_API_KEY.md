# 🔧 修复API Key配置

## 问题诊断

检测到以下问题：

1. **API Key格式不正确**
   - 当前值：`your_opena...`（示例值）
   - 需要：真实的OpenAI API Key（以`sk-`开头，51个字符）

2. **httpx版本兼容性问题**（已修复）

## 解决步骤

### 步骤1: 配置真实的OpenAI API Key

1. **获取OpenAI API Key**
   - 访问：https://platform.openai.com/api-keys
   - 登录您的OpenAI账户
   - 创建新的API Key或使用现有的

2. **编辑.env文件**
   ```bash
   # 打开.env文件
   nano .env
   # 或
   code .env
   ```

3. **更新OPENAI_API_KEY**
   ```bash
   # 将这一行：
   OPENAI_API_KEY=your_openai_api_key_here
   
   # 改为（使用您的真实API Key）：
   OPENAI_API_KEY=sk-你的真实API密钥
   ```

4. **验证格式**
   - API Key应该以 `sk-` 开头
   - 总长度约51个字符
   - 例如：`sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤2: 重启服务器

配置完成后，需要重启服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
uvicorn app.main:app --reload
```

### 步骤3: 测试配置

运行诊断脚本：

```bash
python scripts/test_ai_model.py
```

应该看到：
- ✅ OpenAI API Key配置: 已配置
- ✅ 格式正确: 是
- ✅ OpenAI模型初始化成功

## 验证API Key是否有效

### 方法1: 使用诊断脚本
```bash
python scripts/test_ai_model.py
```

### 方法2: 直接测试API
```bash
curl -X POST "http://localhost:8000/api/v1/generator/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "通用知识",
    "count": 1,
    "topic": "测试",
    "style": "专业"
  }'
```

如果配置正确，应该返回生成的问答对，而不是错误信息。

## 常见问题

### Q: 如何知道API Key是否有效？
A: 运行诊断脚本，如果看到"OpenAI模型初始化成功"和"生成成功"，说明API Key有效。

### Q: API Key格式要求是什么？
A: 
- 必须以 `sk-` 开头
- 长度约51个字符
- 从OpenAI官网获取

### Q: 配置后还是失败怎么办？
A: 
1. 检查.env文件中的值是否正确（没有多余空格）
2. 确认API Key有效且有足够额度
3. 查看日志：`tail -f logs/app.log`
4. 运行诊断脚本：`python scripts/test_ai_model.py`

## 下一步

配置完成后：
1. ✅ 重启服务器
2. ✅ 运行诊断脚本验证
3. ✅ 测试生成API
4. ✅ 开始使用系统

---

**重要提示：** 不要将包含真实API Key的.env文件提交到Git仓库！

