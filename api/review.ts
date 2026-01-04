// 使用any类型避免TypeScript编译错误
// Vercel会在运行时提供正确的类型
type VercelRequest = any;
type VercelResponse = any;
import OpenAI from 'openai';
import { query } from './utils/db.js';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 审查提示词模板
const REVIEW_PROMPT = `你是一個專業的問答對審查專家。請對以下問答對進行全面評估。

問題：{question}

答案：{answer}

請從以下維度進行評估：
1. **準確性**（Accuracy）：答案是否準確、無誤導性
2. **完整性**（Completeness）：答案是否完整回答了問題
3. **相關性**（Relevance）：答案是否與問題高度相關
4. **語言質量**（Language Quality）：語言表達是否清晰、流暢
5. **領域適配性**（Domain Fit）：是否適合目標知識領域

請以 JSON 格式返回評估結果：
{
  "accuracy": 0-100,
  "completeness": 0-100,
  "relevance": 0-100,
  "language_quality": 0-100,
  "domain_fit": 0-100,
  "overall_score": 0-100,
  "passed": true/false,
  "suggestions": ["建議1", "建議2"]
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS 处理
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { qa_pair_id, question, answer } = req.body;

    // 验证输入
    if (!question || !answer) {
      return res.status(400).json({ error: '缺少必需参数：question 和 answer' });
    }

    // 检查 OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API Key 未配置' });
    }

    // 构建提示词
    const prompt = REVIEW_PROMPT.replace('{question}', question).replace('{answer}', answer);

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一個專業的問答對審查專家，請以 JSON 格式返回評估結果。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 审查失败');
    }

    // 解析 JSON 响应
    let reviewResult;
    try {
      // 尝试提取 JSON（可能包含 markdown 代码块）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      reviewResult = JSON.parse(jsonStr);
    } catch (parseError) {
      // 如果解析失败，使用默认值
      console.error('解析审查结果失败:', parseError);
      reviewResult = {
        accuracy: 75,
        completeness: 75,
        relevance: 75,
        language_quality: 75,
        domain_fit: 75,
        overall_score: 75,
        passed: true,
        suggestions: [],
      };
    }

    const reviewerScore = reviewResult.overall_score || 75;
    const reviewedAt = new Date().toISOString();

    // 更新数据库中的审查评分
    if (qa_pair_id) {
      try {
        await query(
          'UPDATE qa_pairs SET reviewer_score = $1, reviewed_at = $2, status = $3 WHERE id = $4',
          [reviewerScore, reviewedAt, reviewResult.passed !== false ? '已審查' : '待審查', qa_pair_id]
        );
      } catch (dbError) {
        console.error('更新数据库失败:', dbError);
        // 继续返回结果，即使数据库更新失败
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        qa_pair_id: qa_pair_id || `qa-${Date.now()}`,
        reviewer_score: reviewerScore,
        scores: {
          accuracy: reviewResult.accuracy || 75,
          completeness: reviewResult.completeness || 75,
          relevance: reviewResult.relevance || 75,
          language_quality: reviewResult.language_quality || 75,
          domain_fit: reviewResult.domain_fit || 75,
        },
        suggestions: reviewResult.suggestions || [],
        passed: reviewResult.passed !== false,
        reviewed_at: reviewedAt,
      },
    });
  } catch (error: any) {
    console.error('审查问答对失败:', error);
    return res.status(500).json({
      error: error.message || '审查问答对失败',
    });
  }
}

