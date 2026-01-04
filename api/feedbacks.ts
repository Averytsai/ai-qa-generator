// 使用any类型避免TypeScript编译错误
// Vercel会在运行时提供正确的类型
type VercelRequest = any;
type VercelResponse = any;
import { query } from './utils/db.js';

// CORS 处理
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST - 提交反馈
    if (req.method === 'POST') {
      const {
        qa_pair_id,
        action,
        modified_question,
        modified_answer,
        feedback_categories,
        review_reason,
      } = req.body;

      if (!qa_pair_id || !action) {
        return res.status(400).json({ error: '缺少必需参数：qa_pair_id 和 action' });
      }

      // 验证action值
      if (!['approve', 'modify', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'action 必须是 approve, modify 或 reject' });
      }

      // 开始事务：插入反馈并更新问答对状态
      const { getClient } = await import('./utils/db.js');
      const client = await getClient();
      
      try {
        await client.query('BEGIN');

        // 1. 插入反馈记录
        const feedbackSql = `
          INSERT INTO feedbacks (qa_pair_id, action, modified_question, modified_answer, feedback_categories, review_reason)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const feedbackResult = await client.query(feedbackSql, [
          qa_pair_id,
          action,
          modified_question || null,
          modified_answer || null,
          feedback_categories || null,
          review_reason || null,
        ]);

        // 2. 更新问答对状态和内容
        let updateSql = 'UPDATE qa_pairs SET ';
        const updateParams: any[] = [];
        let paramIndex = 1;

        if (action === 'approve') {
          updateSql += `status = $${paramIndex++}, `;
          updateParams.push('已通過');
        } else if (action === 'modify') {
          updateSql += `status = $${paramIndex++}, `;
          updateParams.push('已通過'); // 修改后视为已通过
          if (modified_question) {
            updateSql += `question = $${paramIndex++}, `;
            updateParams.push(modified_question);
          }
          if (modified_answer) {
            updateSql += `answer = $${paramIndex++}, `;
            updateParams.push(modified_answer);
          }
        } else if (action === 'reject') {
          updateSql += `status = $${paramIndex++}, `;
          updateParams.push('已拒絕');
        }

        updateSql += `reviewed_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`;
        updateParams.push(qa_pair_id);

        await client.query(updateSql, updateParams);

        await client.query('COMMIT');

        return res.status(201).json({
          success: true,
          data: {
            feedback_id: feedbackResult.rows[0].id,
            message: '反馈已提交',
          },
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    // GET - 获取反馈列表
    if (req.method === 'GET') {
      const { qa_pair_id, page = '1', page_size = '10' } = req.query;

      let sql = 'SELECT * FROM feedbacks WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (qa_pair_id) {
        sql += ` AND qa_pair_id = $${paramIndex++}`;
        params.push(qa_pair_id);
      }

      sql += ' ORDER BY created_at DESC';

      const pageNum = parseInt(page as string, 10);
      const pageSizeNum = parseInt(page_size as string, 10);
      const offset = (pageNum - 1) * pageSizeNum;

      sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(pageSizeNum, offset);

      const result = await query(sql, params);

      return res.status(200).json({
        success: true,
        data: {
          items: result.rows,
          page: pageNum,
          page_size: pageSizeNum,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API错误:', error);
    return res.status(500).json({
      error: error.message || '服务器错误',
    });
  }
}

