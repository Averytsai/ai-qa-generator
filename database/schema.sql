-- PostgreSQL 数据库 Schema
-- 问答对生成系统

-- 注意：PostgreSQL 13+ 内置 gen_random_uuid() 函数，无需安装扩展

-- 问答对表
CREATE TABLE IF NOT EXISTS qa_pairs (
    id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,  -- '通用知識', '技術流程', '故障排除', '資安法規', '應用案例'
    status VARCHAR(50) NOT NULL DEFAULT '待審查',  -- '待審查', '已審查', '已通過', '已拒絕', '已修改'
    reviewer_score INTEGER CHECK (reviewer_score >= 0 AND reviewer_score <= 100),  -- 0-100
    prompt_template_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_qa_pairs_category ON qa_pairs(category);
CREATE INDEX IF NOT EXISTS idx_qa_pairs_status ON qa_pairs(status);
CREATE INDEX IF NOT EXISTS idx_qa_pairs_created_at ON qa_pairs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_pairs_status_category ON qa_pairs(status, category);

-- 反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
    qa_pair_id UUID NOT NULL REFERENCES qa_pairs(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'modify', 'reject')),  -- 'approve', 'modify', 'reject'
    modified_question TEXT,
    modified_answer TEXT,
    feedback_categories TEXT[],  -- PostgreSQL数组类型
    review_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_feedbacks_qa_pair_id ON feedbacks(qa_pair_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_action ON feedbacks(action);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_qa_pairs_updated_at BEFORE UPDATE ON qa_pairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据（可选，用于测试）
-- INSERT INTO qa_pairs (question, answer, category, status) VALUES
-- ('什麼是 KVM？', 'KVM 是 Kernel-based Virtual Machine 的縮寫...', '通用知識', '待審查');

