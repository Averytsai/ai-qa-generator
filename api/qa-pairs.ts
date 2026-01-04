import type { VercelRequest, VercelResponse } from '@vercel/node';

// #region agent log
console.log('[qa-pairs.ts] Module loading started');
console.log('[qa-pairs.ts] Before importing db.js');
// #endregion

import { query } from './utils/db.js';

// #region agent log
console.log('[qa-pairs.ts] db.js imported successfully', { hasQuery: typeof query === 'function' });
// #endregion

// CORS 处理
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // #region agent log
  console.log('[qa-pairs.ts] Handler function called', { method: req.method, url: req.url, query: req.query });
  // #endregion
  
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // #region agent log
    console.log('[qa-pairs.ts] Before database query', { method: req.method });
    // #endregion
    // GET - 获取问答对列表
    if (req.method === 'GET') {
      const { category, status, page = '1', page_size = '10' } = req.query;
      
      let sql = 'SELECT * FROM qa_pairs WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (category) {
        sql += ` AND category = $${paramIndex++}`;
        params.push(category);
      }

      if (status) {
        sql += ` AND status = $${paramIndex++}`;
        params.push(status);
      }

      // 排序
      sql += ' ORDER BY created_at DESC';

      // 分页
      const pageNum = parseInt(page as string, 10);
      const pageSizeNum = parseInt(page_size as string, 10);
      const offset = (pageNum - 1) * pageSizeNum;
      
      sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(pageSizeNum, offset);

      // 获取总数
      let countSql = 'SELECT COUNT(*) as total FROM qa_pairs WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (category) {
        countSql += ` AND category = $${countParamIndex++}`;
        countParams.push(category);
      }

      if (status) {
        countSql += ` AND status = $${countParamIndex++}`;
        countParams.push(status);
      }

      const [itemsResult, countResult] = await Promise.all([
        query(sql, params),
        query(countSql, countParams),
      ]);

      const total = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(total / pageSizeNum);

      return res.status(200).json({
        success: true,
        data: {
          items: itemsResult.rows,
          total,
          page: pageNum,
          page_size: pageSizeNum,
          total_pages: totalPages,
        },
      });
    }

    // POST - 创建问答对
    if (req.method === 'POST') {
      const { question, answer, category, status = '待審查', reviewer_score, prompt_template_id } = req.body;

      if (!question || !answer || !category) {
        return res.status(400).json({ error: '缺少必需参数：question, answer, category' });
      }

      const sql = `
        INSERT INTO qa_pairs (question, answer, category, status, reviewer_score, prompt_template_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await query(sql, [
        question,
        answer,
        category,
        status,
        reviewer_score || null,
        prompt_template_id || null,
      ]);

      return res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    }

    // PUT - 更新问答对
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { question, answer, category, status, reviewer_score, reviewed_at } = req.body;

      if (!id) {
        return res.status(400).json({ error: '缺少必需参数：id' });
      }

      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (question !== undefined) {
        updates.push(`question = $${paramIndex++}`);
        params.push(question);
      }
      if (answer !== undefined) {
        updates.push(`answer = $${paramIndex++}`);
        params.push(answer);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramIndex++}`);
        params.push(category);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        params.push(status);
      }
      if (reviewer_score !== undefined) {
        updates.push(`reviewer_score = $${paramIndex++}`);
        params.push(reviewer_score);
      }
      if (reviewed_at !== undefined) {
        updates.push(`reviewed_at = $${paramIndex++}`);
        params.push(reviewed_at);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: '没有要更新的字段' });
      }

      params.push(id);
      const sql = `
        UPDATE qa_pairs
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '问答对不存在' });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0],
      });
    }

    // DELETE - 删除问答对
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: '缺少必需参数：id' });
      }

      const sql = 'DELETE FROM qa_pairs WHERE id = $1 RETURNING *';
      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: '问答对不存在' });
      }

      return res.status(200).json({
        success: true,
        message: '删除成功',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    // #region agent log
    console.error('[qa-pairs.ts] Error caught in handler', { error: error.message, code: error.code, stack: error.stack?.substring(0, 300) });
    // #endregion
    
    console.error('❌ QA Pairs API错误:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      stack: error.stack?.substring(0, 500)
    });
    
    // 如果是数据库连接错误，提供更详细的错误信息
    if (error.message?.includes('DATABASE_URL') || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({
        error: '数据库连接失败。请检查 DATABASE_URL 环境变量是否正确设置。',
        details: error.message,
        hint: '请在 Vercel Dashboard 的 Environment Variables 中设置 DATABASE_URL'
      });
    }
    
    return res.status(500).json({
      error: error.message || '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

