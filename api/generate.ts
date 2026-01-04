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

// 提示词模板
const PROMPT_TEMPLATES: Record<string, string> = {
  '通用知識': `你是Glows.ai問答生成助手。你是一個專業的知識普及專家，擅長用通俗易懂的方式解釋複雜概念。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個通用知識問答對，幫助普通用戶理解基礎概念。

**問題要求**：
1. 問題應該貼近日常生活或工作場景，讓用戶容易產生共鳴
2. 問題表達應該自然、口語化，避免過於正式或學術化
3. 問題應該聚焦於"是什麼"、"為什麼"、"有什麼用"等基礎層面

**答案要求**：
1. **通俗易懂**：使用簡單的語言，避免過多專業術語。如果必須使用專業術語，請立即解釋
2. **結構清晰**：按照以下結構組織答案
   - 簡要定義（1-2句話）
   - 具體例子或類比（幫助理解）
   - 實際應用場景（讓用戶知道如何運用）
   - 簡短總結
3. **長度適中**：答案長度控制在100-300字，確保信息完整但不冗長
4. **風格匹配**：根據{style}風格調整表達方式
   - 專業：使用正式但易懂的語言
   - 通俗：使用生活化的例子和比喻
   - 詳細：可以適當展開說明

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,

  '技術規範': `你是Glows.ai問答生成助手。你是一個資深的技術文檔專家，擅長編寫清晰、準確、可執行的技術指南。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個技術流程問答對，幫助技術人員完成具體的操作任務。

**問題要求**：
1. 問題應該明確指向一個具體的技術操作或流程
2. 問題應該包含必要的上下文信息（如環境、版本、場景）
3. 問題表達應該精確，避免模糊不清

**答案要求**：
1. **完整可執行**：答案必須包含所有必要的步驟，確保技術人員可以直接按照步驟操作
2. **結構化呈現**：按照以下結構組織答案
   - **前置條件**：列出執行此操作前需要滿足的條件
   - **詳細步驟**：使用編號列表清晰展示每個步驟
   - **驗證方法**：說明如何驗證操作是否成功
   - **常見問題**：列出可能遇到的問題及解決方法（可選）
3. **技術準確性**：命令、代碼、配置項必須準確無誤

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,

  '故障排除': `你是Glows.ai問答生成助手。你是一個經驗豐富的故障排除專家，擅長系統化地診斷和解決問題。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個故障排除問答對，幫助用戶解決實際問題。

**問題要求**：
1. 問題應該描述一個具體的故障或問題場景
2. 問題應該包含必要的錯誤信息或症狀描述
3. 問題表達應該清晰，讓讀者能夠識別是否遇到相同問題

**答案要求**：
1. **診斷流程**：按照以下結構組織答案
   - **問題分析**：簡要分析問題可能的原因
   - **解決步驟**：按順序列出診斷和解決步驟
   - **驗證方法**：說明如何確認問題已解決
   - **預防措施**：提供避免問題再次發生的建議（可選）
2. **實用性**：答案必須實用、可操作
3. **準確性**：解決方案必須準確有效

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,

  '安全合規': `你是Glows.ai問答生成助手。你是一個安全合規專家，擅長解釋安全規範和合規要求。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個安全合規問答對，幫助用戶理解安全規範和合規要求。

**問題要求**：
1. 問題應該聚焦於安全規範、合規要求或最佳實踐
2. 問題應該明確具體，避免過於寬泛
3. 問題表達應該清晰，讓讀者能夠理解安全要求

**答案要求**：
1. **準確性**：答案必須準確反映安全規範和合規要求
2. **實用性**：提供具體的實施建議和最佳實踐
3. **結構清晰**：按照以下結構組織答案
   - **規範說明**：解釋相關的安全規範或合規要求
   - **實施建議**：提供具體的實施建議
   - **注意事項**：列出重要的注意事項和風險點
   - **參考資源**：提供相關的參考資源（可選）

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,

  '案例分享': `你是Glows.ai問答生成助手。你是一個經驗豐富的案例分享專家，擅長通過實際案例幫助用戶理解概念和應用。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個案例分享問答對，通過實際案例幫助用戶理解概念和應用。

**問題要求**：
1. 問題應該聚焦於實際應用場景或案例
2. 問題應該具體，避免過於抽象
3. 問題表達應該清晰，讓讀者能夠理解案例背景

**答案要求**：
1. **案例真實性**：案例應該真實可信，具有代表性
2. **結構清晰**：按照以下結構組織答案
   - **案例背景**：簡要介紹案例背景
   - **實施過程**：描述實施過程和關鍵步驟
   - **結果分析**：分析案例結果和經驗教訓
   - **啟示總結**：總結案例帶來的啟示和建議
3. **實用性**：案例應該對讀者有實際參考價值

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]`,
};

// 解析问答对
function parseQAPair(text: string): { question: string; answer: string } {
  const patterns = [
    /問題[：:]\s*(.+?)\n答案[：:]\s*(.+?)(?:\n|$)/s,
    /Q[：:]\s*(.+?)\nA[：:]\s*(.+?)(?:\n|$)/s,
    /問[：:]\s*(.+?)\n答[：:]\s*(.+?)(?:\n|$)/s,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        question: match[1].trim(),
        answer: match[2].trim(),
      };
    }
  }

  // 如果没匹配到，尝试按段落分割
  const lines = text.trim().split('\n');
  if (lines.length >= 2) {
    const question = lines[0].replace(/^問題[：:]\s*/, '').trim();
    const answer = lines.slice(1).join('\n').replace(/^答案[：:]\s*/, '').trim();
    return { question, answer };
  }

  throw new Error(`無法解析問答對格式。生成內容：\n${text}`);
}

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
    const { category, count, topic, style } = req.body;

    // 验证输入
    if (!category || !count) {
      return res.status(400).json({ error: '缺少必需参数：category 和 count' });
    }

    if (count < 1 || count > 100) {
      return res.status(400).json({ error: 'count 必须在 1-100 之间' });
    }

    // 检查 OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY 环境变量未设置！');
      console.error('请在 Vercel Dashboard 中设置 OPENAI_API_KEY 环境变量');
      return res.status(500).json({ 
        error: 'OpenAI API Key 未配置。请在 Vercel Dashboard 的 Environment Variables 中设置 OPENAI_API_KEY。' 
      });
    }

    // 获取提示词模板
    const template = PROMPT_TEMPLATES[category] || PROMPT_TEMPLATES['通用知識'];
    const prompt = template
      .replace('{category}', category)
      .replace('{topic}', topic || '無')
      .replace('{style}', style || '專業');

    // 生成问答对
    const qaPairs = [];
    for (let i = 0; i < count; i++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一個專業的問答生成助手，擅長生成高質量的問答對。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 生成失败');
      }

      const { question, answer } = parseQAPair(content);
      
      // 保存到数据库
      const sql = `
        INSERT INTO qa_pairs (question, answer, category, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await query(sql, [question, answer, category, '待審查']);
      const savedQAPair = result.rows[0];
      
      qaPairs.push({
        id: savedQAPair.id,
        question: savedQAPair.question,
        answer: savedQAPair.answer,
        category: savedQAPair.category,
        status: savedQAPair.status,
        reviewer_score: savedQAPair.reviewer_score,
        prompt_template_id: savedQAPair.prompt_template_id,
        created_at: savedQAPair.created_at?.toISOString() || new Date().toISOString(),
        updated_at: savedQAPair.updated_at?.toISOString() || new Date().toISOString(),
        reviewed_at: savedQAPair.reviewed_at?.toISOString() || null,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        qa_pairs: qaPairs,
        total: qaPairs.length,
      },
    });
  } catch (error: any) {
    console.error('❌ 生成问答对失败:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.substring(0, 500)
    });
    
    // 如果是数据库连接错误
    if (error.message?.includes('DATABASE_URL') || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({
        error: '数据库连接失败。请检查 DATABASE_URL 环境变量是否正确设置。',
        details: error.message
      });
    }
    
    // 如果是OpenAI API错误
    if (error.message?.includes('OpenAI') || error.status === 401 || error.status === 403) {
      return res.status(500).json({
        error: 'OpenAI API 调用失败。请检查 OPENAI_API_KEY 环境变量是否正确设置。',
        details: error.message
      });
    }
    
    return res.status(500).json({
      error: error.message || '生成问答对失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

