# 审查评分标准和人工反馈机制

## 📊 审查评分标准

审查评分（`reviewer_score`）由AI审查模块计算，位于 `app/core/reviewer.py` 的 `_create_review_prompt` 方法。

### 评分维度（5个维度，每个0-100分）

审查AI会从以下5个维度对问答对进行评分：

#### 1. **準確性（Accuracy）** - 0-100分
- **评估标准**：答案是否正確、無誤導性
- **高分标准**：答案准确无误，没有错误信息
- **低分标准**：答案有错误或误导性信息

#### 2. **完整性（Completeness）** - 0-100分
- **评估标准**：答案是否完整回答了問題
- **高分标准**：答案全面回答了问题的各个方面
- **低分标准**：答案不完整，遗漏重要信息

#### 3. **相關性（Relevance）** - 0-100分
- **评估标准**：答案是否與問題高度相關
- **高分标准**：答案直接相关，切中要点
- **低分标准**：答案偏离问题，相关性低

#### 4. **語言質量（Language Quality）** - 0-100分
- **评估标准**：表達是否清晰、專業
- **高分标准**：表达清晰、专业、易懂
- **低分标准**：表达模糊、不专业、难以理解

#### 5. **領域適配性（Domain Fit）** - 0-100分
- **评估标准**：是否符合該知識領域的特點
- **高分标准**：符合领域特点，使用专业术语
- **低分标准**：不符合领域特点，术语使用不当

### 总分计算

**总体评分（overall_score）** = 5个维度分数的平均值

```python
overall_score = (accuracy + completeness + relevance + language_quality + domain_fit) / 5
```

### 通过标准

- **passed = true**：当 `overall_score >= 60` 时
- **passed = false**：当 `overall_score < 60` 时

### 审查Prompt

审查AI使用的Prompt模板：

```
你是一個專業的問答質量審查員。請對以下問答對進行全面評估。

知識領域：{category}

問題：
{question}

答案：
{answer}

請從以下五個維度進行評分（每個維度0-100分），並提供改進建議：

1. **準確性（Accuracy）**：答案是否正確、無誤導性
2. **完整性（Completeness）**：答案是否完整回答了問題
3. **相關性（Relevance）**：答案是否與問題高度相關
4. **語言質量（Language Quality）**：表達是否清晰、專業
5. **領域適配性（Domain Fit）**：是否符合{category}領域的特點

請以JSON格式返回結果：
{
    "accuracy": 85,
    "completeness": 80,
    "relevance": 75,
    "language_quality": 82,
    "domain_fit": 70,
    "overall_score": 78,
    "suggestions": [
        "建議1",
        "建議2"
    ],
    "passed": true
}

請確保返回的是有效的JSON格式。
```

### 审查参数

- **Temperature**: 0.3（较低温度，确保审查结果更稳定一致）
- **Max Tokens**: 500（审查结果通常较短）

---

## 🔄 人工反馈机制

### 反馈提交流程

当人工审核员提交反馈时（`/api/v1/feedback/submit`），系统会：

1. **更新问答对状态**
   - `approve` → 状态变为"已通过"
   - `modify` → 状态变为"已修改"，更新问题和答案
   - `reject` → 状态变为"已拒绝"

2. **保存反馈记录**
   - 创建 `Review` 记录
   - 保存操作类型（approve/modify/reject）
   - 保存修改后的内容（如果有）
   - 保存反馈分类和审查原因

### 反馈数据结构

```python
Review {
    qa_pair_id: UUID,           # 关联的问答对ID
    action: ReviewAction,       # approve/modify/reject
    modified_question: Text,    # 修改后的问题（如果action=modify）
    modified_answer: Text,      # 修改后的答案（如果action=modify）
    feedback_categories: JSON,  # 反馈分类列表
    review_reason: Text,        # 审查原因
    created_at: DateTime        # 创建时间
}
```

---

## 🤖 人工反馈对审查AI的影响

### 当前实现状态

**⚠️ 重要发现**：根据代码分析，**目前人工反馈还没有直接用于优化审查AI的Prompt**。

### 当前机制

1. **反馈数据存储**
   - ✅ 反馈数据已保存到数据库（`Review` 表）
   - ✅ 有 `FeedbackAnalysis` 模型用于存储分析结果
   - ❌ **但还没有实现反馈分析逻辑**

2. **审查AI Prompt**
   - ✅ 审查Prompt是固定的模板
   - ❌ **目前不会根据反馈动态调整**

### 预期的优化机制（待实现）

根据系统设计，人工反馈应该通过以下方式影响审查AI：

#### 1. 反馈分析模块（待实现）

应该有一个模块定期分析反馈数据：

```python
# 预期功能（待实现）
class FeedbackAnalyzer:
    def analyze_feedback(self, category: QACategory, period_days: int = 30):
        """
        分析指定时间段内的反馈数据
        
        分析内容：
        - 常见问题类型
        - AI审查评分 vs 人工反馈的一致性
        - 需要改进的评分维度
        - Prompt优化建议
        """
        pass
```

#### 2. Prompt优化机制（待实现）

根据反馈分析结果优化审查Prompt：

```python
# 预期功能（待实现）
def optimize_review_prompt(
    category: QACategory,
    feedback_analysis: FeedbackAnalysis
) -> str:
    """
    根据反馈分析结果优化审查Prompt
    
    优化方向：
    - 调整评分权重
    - 添加常见错误检查点
    - 强化特定维度的评估标准
    """
    pass
```

#### 3. 学习机制（待实现）

从人工反馈中学习：

- **一致性分析**：比较AI评分和人工反馈的一致性
- **错误模式识别**：识别AI经常误判的情况
- **Prompt迭代**：根据反馈不断优化Prompt模板

---

## 📈 建议的实现方案

### 方案1：基于反馈统计的Prompt优化

1. **收集反馈数据**
   - 统计每个维度的常见问题
   - 分析AI评分与人工反馈的差异

2. **动态调整Prompt**
   - 在Prompt中添加常见错误检查点
   - 根据反馈调整评分标准说明

### 方案2：基于案例的学习

1. **建立案例库**
   - 保存人工修改的案例
   - 标注修改原因和类型

2. **在Prompt中加入案例**
   - 提供正面和负面案例
   - 让AI参考案例进行审查

### 方案3：评分权重调整

1. **分析反馈数据**
   - 识别哪些维度AI评分与人工差异最大
   - 调整这些维度的权重

2. **动态权重**
   - 根据反馈数据动态调整各维度权重
   - 提高一致性高的维度权重

---

## 📍 代码位置

- **审查评分逻辑**：`app/core/reviewer.py` 第25-72行（`_create_review_prompt`）
- **评分解析**：`app/core/reviewer.py` 第74-143行（`_parse_review_result`）
- **反馈提交**：`app/api/v1/feedback.py` 第20-87行（`submit_feedback`）
- **反馈数据模型**：`app/models/review.py`（Review模型）
- **反馈分析模型**：`app/models/feedback_analysis.py`（FeedbackAnalysis模型，待使用）

---

## 💡 总结

### 当前状态

✅ **已实现**：
- 5维度审查评分标准
- 人工反馈提交和存储
- 反馈数据结构

❌ **待实现**：
- 反馈数据分析
- Prompt动态优化
- 学习机制

### 下一步建议

如果需要实现反馈驱动的优化，建议：

1. **实现反馈分析模块**
   - 定期分析反馈数据
   - 识别常见问题和改进点

2. **实现Prompt优化机制**
   - 根据分析结果动态调整Prompt
   - 添加常见错误检查点

3. **实现学习循环**
   - 持续收集反馈
   - 定期优化Prompt
   - 评估优化效果

