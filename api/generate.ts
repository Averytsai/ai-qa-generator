// api/generate.ts
type VercelRequest = any;
type VercelResponse = any;

import OpenAI from 'openai';
import { query } from './utils/db';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS
function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// 提示词模板（你原本的可沿用；我這裡示意，保留你的內容即可）
const PROMPT_TEMPLATES: Record<string, string> = {
  '通用知識': `你是Glows.ai問答生成助手。
知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,
  '技術規範': `你是Glows.ai問答生成助手。
知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,
  '故障排除': `你是Glows.ai問答生成助手。
知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,
  '安全合規': `你是Glows.ai問答生成助手。
知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,
  '案例分享': `你是Glows.ai問答生成助手。
知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,
};

function buildPrompt(category: string, topic?: string, style?: string) {
  const template = PROMPT_TEMPLATES[category] || PROMPT_TEMPLATES['通用知識'];
  return template
    .replace('{category}', category)
    .replace('{topic}', topic || '無')
    .replace('{style}', style || '專業');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  // ✅ 先放行 OPTIONS，否則 preflight 會被你 405 擋掉
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ 再判斷 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, count, topic, style } = req.body || {};

    if (!category || !count) {
      return res.status(400).json({ error: '缺少必需参数：category 和 count' });
    }

    const n = Number(count);
    if (!Number.isFinite(n) || n < 1 || n > 20) {
      return res.status(400).json({ error: 'count 必须在 1-20 之间' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY 未配置' });
    }

    const prompt = buildPrompt(category, topic, style);

    // ✅ 改成一次請模型輸出 N 筆 JSON，避免串行呼叫超時
    const system = [
      '你是高品質問答生成助手。',
      '你必須只輸出 JSON，不要輸出任何多餘文字。',
      'JSON 格式：{"items":[{"question":"...","answer":"..."}]}',
      `items 長度必須等於 ${n}。`,
      'question 與 answer 使用繁體中文。',
      'question 不要包含「問題：」前綴；answer 不要包含「答案：」前綴。',
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `${prompt}\n\n請生成 ${n} 組問答，並依指定 JSON 格式輸出。` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      // 如果你的 SDK 支援，會更穩；不支援也不會影響（可刪）
      response_format: { type: 'json_object' } as any,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('AI 生成失败：空內容');

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`AI 回傳非 JSON：${content.slice(0, 200)}`);
    }

    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    if (items.length !== n) {
      throw new Error(`AI 生成筆數不符，期望 ${n}，實際 ${items.length}`);
    }

    const cleaned = items.map((x: any, idx: number) => {
      const question = String(x?.question || '').trim();
      const answer = String(x?.answer || '').trim();
      if (!question || !answer) throw new Error(`第 ${idx + 1} 筆 question/answer 為空`);
      return { question, answer };
    });

    // ✅ 批次寫入 DB（一次 INSERT 多筆）
    const valuesSql: string[] = [];
    const params: any[] = [];
    let p = 1;

    for (const item of cleaned) {
      valuesSql.push(`($${p++}, $${p++}, $${p++}, $${p++})`);
      params.push(item.question, item.answer, category, '待審查');
    }

    const insertSql = `
      INSERT INTO qa_pairs (question, answer, category, status)
      VALUES ${valuesSql.join(',')}
      RETURNING id, question, answer, category, status, reviewer_score, prompt_template_id, created_at, updated_at, reviewed_at
    `;

    const saved = await query(insertSql, params);

    const qaPairs = saved.rows.map((row: any) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category,
      status: row.status,
      reviewer_score: row.reviewer_score,
      prompt_template_id: row.prompt_template_id,
      created_at: row.created_at?.toISOString?.() ?? new Date().toISOString(),
      updated_at: row.updated_at?.toISOString?.() ?? new Date().toISOString(),
      reviewed_at: row.reviewed_at?.toISOString?.() ?? null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        qa_pairs: qaPairs,
        total: qaPairs.length,
      },
    });
  } catch (error: any) {
    console.error('❌ generate API error:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack?.substring?.(0, 500),
    });

    if (error?.message?.includes('DATABASE_URL') || error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      return res.status(500).json({ error: '数据库连接失败', details: error.message });
    }

    if (error?.status === 401 || error?.status === 403) {
      return res.status(500).json({ error: 'OpenAI API 调用失败', details: error.message });
    }

    return res.status(500).json({ error: error?.message || '生成问答对失败' });
  }
}
