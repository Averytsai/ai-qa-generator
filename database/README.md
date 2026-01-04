# 数据库设置说明

## 数据库连接信息

```
DATABASE_URL=postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db
```

## 执行SQL脚本

### 方法1：使用psql命令行

```bash
psql -h tw-07.access.glows.ai -p 5432 -U user -d qa_generator_db -f schema.sql
```

### 方法2：使用pgAdmin或其他数据库管理工具

1. 连接到数据库服务器
2. 选择数据库 `qa_generator_db`
3. 执行 `schema.sql` 文件中的所有SQL语句

## 验证表结构

执行以下SQL验证表是否创建成功：

```sql
-- 查看所有表
\dt

-- 查看qa_pairs表结构
\d qa_pairs

-- 查看feedbacks表结构
\d feedbacks

-- 查看索引
\di
```

## 表结构说明

### qa_pairs（问答对表）
- `id`: UUID主键
- `question`: 问题文本
- `answer`: 答案文本
- `category`: 分类（通用知識、技術流程、故障排除、資安法規、應用案例）
- `status`: 状态（待審查、已審查、已通過、已拒絕、已修改）
- `reviewer_score`: AI审查评分（0-100）
- `created_at`: 创建时间
- `updated_at`: 更新时间（自动更新）
- `reviewed_at`: 审查时间

### feedbacks（反馈表）
- `id`: UUID主键
- `qa_pair_id`: 关联的问答对ID（外键）
- `action`: 操作类型（approve、modify、reject）
- `modified_question`: 修改后的问题（如果action=modify）
- `modified_answer`: 修改后的答案（如果action=modify）
- `feedback_categories`: 反馈分类数组
- `review_reason`: 审查原因
- `created_at`: 创建时间

## 注意事项

1. 确保数据库用户有创建表和索引的权限
2. 如果表已存在，脚本会跳过创建（使用 `CREATE TABLE IF NOT EXISTS`）
3. 外键约束确保数据完整性
4. 触发器自动更新 `updated_at` 字段

