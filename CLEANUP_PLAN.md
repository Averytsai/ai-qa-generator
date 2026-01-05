# 项目清理计划

## ✅ 保留的文件和目录

### 核心代码
- `frontend/` - 前端代码（React + Vite）
- `api/` - 后端API（Vercel Serverless Functions）
- `vercel.json` - Vercel部署配置
- `package.json` - 根目录package.json
- `.gitignore` - Git忽略配置
- `.env` - 环境变量（不提交）
- `env.example` - 环境变量模板

### 文档
- `README.md` - 项目主文档（需要更新）
- `frontend/README.md` - 前端文档

---

## ❌ 删除的文件和目录

### 1. 旧的Python后端代码
- `app/` - 整个目录（旧的FastAPI后端）
- `alembic/` - Python数据库迁移工具
- `alembic.ini` - Alembic配置
- `requirements.txt` - Python依赖
- `requirements/` - Python依赖目录
- `runtime.txt` - Python运行时配置
- `Procfile` - Heroku部署配置
- `scripts/` - Python脚本（旧的）
- `tests/` - Python测试（空的）

### 2. 数据库配置脚本（已配置完成）
- `database/` - 整个目录（配置脚本和文档）

### 3. 临时文档和调试文件
- 所有 `*_ANALYSIS.md`
- 所有 `*_CHECKLIST.md`
- 所有 `*_DIAGNOSIS.md`
- 所有 `*_FIX.md`
- 所有 `*_RESULT.md`
- 所有 `*_SUMMARY.md`
- 所有 `*_SOLUTION.md`
- `GETTING_STARTED.md` - 旧的开发指南
- `HOW_TO_FIND_FUNCTIONS.md`
- `PRE_PUSH_CHECKLIST.md`
- `PROBLEM_ANALYSIS.md`
- `ROOT_CAUSE_*.md`
- `TEST_RESULTS*.md`
- `VERCEL_*.md`（除了部署相关的）

### 4. 测试和诊断脚本
- `test_*.js` - 根目录的测试脚本
- `diagnose_local.js`
- `api/test-*.ts` - API测试文件（保留test-basic.js作为示例）
- `api/test-*.js` - API测试文件

### 5. 日志和缓存
- `logs/` - Python应用日志
- `venv/` - Python虚拟环境（应该在.gitignore中）

---

## 📋 清理步骤

1. 删除旧的Python后端代码
2. 删除数据库配置脚本
3. 删除临时文档
4. 删除测试脚本
5. 更新README.md
6. 更新.gitignore（确保venv被忽略）

