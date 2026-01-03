# 启动前后端服务器指南

## 🚀 快速启动

### 1. 启动后端服务器

```bash
# 激活虚拟环境
source venv/bin/activate

# 设置PostgreSQL PATH（如果需要）
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# 启动后端服务器
uvicorn app.main:app --reload
```

后端将在 http://localhost:8000 启动

### 2. 启动前端服务器

打开新的终端窗口：

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:3000 启动

## 📍 访问地址

- **前端界面**: http://localhost:3000
- **后端API文档**: http://localhost:8000/docs
- **后端健康检查**: http://localhost:8000/health

## ✅ 验证系统运行

1. **检查后端**: 访问 http://localhost:8000/health
2. **检查前端**: 访问 http://localhost:3000
3. **检查API连接**: 在前端页面尝试生成问答对

## 🎯 使用流程

1. **生成问答对**
   - 访问 http://localhost:3000/generate
   - 填写表单并生成

2. **审查问答对**
   - 访问 http://localhost:3000/review
   - 点击"审查"按钮

3. **提交反馈**
   - 访问 http://localhost:3000/feedback
   - 审核并提交反馈

4. **查看知识库**
   - 访问 http://localhost:3000/knowledge
   - 浏览已通过的问答对

5. **查看统计**
   - 访问 http://localhost:3000/analytics
   - 查看数据统计

---

**系统已完全配置好，可以开始使用了！** 🎊

