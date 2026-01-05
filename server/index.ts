import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// DB
import { query } from '../api/utils/db';

// ✅ 把 generate handler 掛進來
import generateHandler from '../api/generate';

const app = express();
app.use(cors());
app.use(express.json());

// 健康檢查和數據庫連接測試
app.get('/api/health-db', async (_req, res) => {
  try {
    const r = await query('SELECT 1 as ok');
    res.json({ ok: true, select1: r.rows?.[0] ?? null });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      code: e?.code ?? null,
      message: e?.message ?? null,
      detail: e?.detail ?? null,
    });
  }
});

// Categories API
app.get('/api/categories', async (_req, res) => {
  try {
    const CATEGORIES = [
      { id: '通用知識', name: '通用知識', description: '基礎概念、常識性內容', qa_count: 0 },
      { id: '技術規範', name: '技術規範', description: '技術規範、操作流程', qa_count: 0 },
      { id: '故障排除', name: '故障排除', description: '常見問題、解決方案', qa_count: 0 },
      { id: '安全合規', name: '安全合規', description: '安全規範、合規要求', qa_count: 0 },
      { id: '案例分享', name: '案例分享', description: '實際應用、案例分享', qa_count: 0 },
    ];

    res.json({ success: true, data: { categories: CATEGORIES } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'Server error' });
  }
});

// History API
app.get('/api/history', async (req, res) => {
  try {
    const { category, status, page = '1', page_size = '10' } = req.query as any;

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

    sql += ' ORDER BY created_at DESC';

    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(page_size, 10);
    const offset = (pageNum - 1) * pageSizeNum;

    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(pageSizeNum, offset);

    const countSqlParts: string[] = ['SELECT COUNT(*) as total FROM qa_pairs WHERE 1=1'];
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (category) {
      countSqlParts.push(` AND category = $${countParamIndex++}`);
      countParams.push(category);
    }
    if (status) {
      countSqlParts.push(` AND status = $${countParamIndex++}`);
      countParams.push(status);
    }
    const countSql = countSqlParts.join('');

    const [itemsResult, countResult] = await Promise.all([query(sql, params), query(countSql, countParams)]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / pageSizeNum);

    const items = itemsResult.rows.map((row: any) => ({
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

    res.json({
      success: true,
      data: { items, total, page: pageNum, page_size: pageSizeNum, total_pages: totalPages },
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      code: e?.code ?? null,
      message: e?.message ?? null,
      detail: e?.detail ?? null,
    });
  }
});

// QA Pairs API - GET
app.get('/api/qa-pairs', async (req, res) => {
  try {
    const { category, status, page = '1', page_size = '10' } = req.query as any;

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

    sql += ' ORDER BY created_at DESC';

    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(page_size, 10);
    const offset = (pageNum - 1) * pageSizeNum;

    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(pageSizeNum, offset);

    // count sql（用同樣的參數順序，避免錯位）
    let countSql = 'SELECT COUNT(*) as total FROM qa_pairs WHERE 1=1';
    const countParams: any[] = [];
    let cp = 1;

    if (category) {
      countSql += ` AND category = $${cp++}`;
      countParams.push(category);
    }
    if (status) {
      countSql += ` AND status = $${cp++}`;
      countParams.push(status);
    }

    const [itemsResult, countResult] = await Promise.all([query(sql, params), query(countSql, countParams)]);

    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    const totalPages = Math.ceil(total / pageSizeNum);

    const items = itemsResult.rows.map((row: any) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category,
      status: row.status,
      reviewer_score: row.reviewer_score,
      created_at: row.created_at?.toISOString?.() ?? new Date().toISOString(),
      updated_at: row.updated_at?.toISOString?.() ?? new Date().toISOString(),
    }));

    res.json({
      success: true,
      data: { items, total, page: pageNum, page_size: pageSizeNum, total_pages: totalPages },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'Server error' });
  }
});

// QA Pairs API - POST
app.post('/api/qa-pairs', async (req, res) => {
  try {
    const { question, answer, category, status = '待審查' } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: question, answer, category',
      });
    }

    const result = await query(
      `INSERT INTO qa_pairs (question, answer, category, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [question, answer, category, status]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'Server error' });
  }
});

// QA Pairs API - PUT
app.put('/api/qa-pairs', async (req, res) => {
  try {
    const { id, question, answer, category, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required field: id' });
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

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `UPDATE qa_pairs SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query(sql, params);

    res.json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'Server error' });
  }
});

// QA Pairs API - DELETE
app.delete('/api/qa-pairs', async (req, res) => {
  try {
    const { id } = req.query as any;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: id' });
    }

    await query('DELETE FROM qa_pairs WHERE id = $1', [id]);

    res.json({ success: true, message: 'QA pair deleted successfully' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'Server error' });
  }
});

// ✅ Generate API - POST / OPTIONS（接到 api/generate.ts）
app.options('/api/generate', (req, res) => generateHandler(req, res));
app.post('/api/generate', (req, res) => generateHandler(req, res));

// Review API - POST（暫留 501，之後你要我也可以幫你做）
app.post('/api/review', async (_req, res) => {
  res.status(501).json({
    success: false,
    error: 'Review API requires OpenAI integration. Not implemented in local server yet.',
  });
});

// Feedbacks API - GET
app.get('/api/feedbacks', async (req, res) => {
  try {
    const { qa_pair_id, page = '1', page_size = '10' } = req.query as any;

    let sql = 'SELECT * FROM feedbacks WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (qa_pair_id) {
      sql += ` AND qa_pair_id = $${paramIndex++}`;
      params.push(qa_pair_id);
    }

    sql += ' ORDER BY created_at DESC';

    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(page_size, 10);
    const offset = (pageNum - 1) * pageSizeNum;

    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(pageSizeNum, offset);

    const result = await query(sql, params);

    res.json({ success: true, data: { items: result.rows } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'Server error' });
  }
});

// Feedbacks API - POST
app.post('/api/feedbacks', async (req, res) => {
  try {
    const { qa_pair_id, action, modified_question, modified_answer, feedback_categories, review_reason } = req.body;

    if (!qa_pair_id || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: qa_pair_id, action',
      });
    }

    // 插入 feedback
    const feedbackResult = await query(
      `INSERT INTO feedbacks (qa_pair_id, action, modified_question, modified_answer, feedback_categories, review_reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        qa_pair_id,
        action,
        modified_question ?? null,
        modified_answer ?? null,
        feedback_categories ?? null,
        review_reason ?? null,
      ]
    );

    // ✅ 修正版：更新 QA pair 狀態/內容
    let newStatus = '待審查';
    if (action === 'approve') newStatus = '已通過';
    if (action === 'reject') newStatus = '已拒絕';
    if (action === 'modify') newStatus = '已修改';

    if (action === 'modify') {
      if (modified_question || modified_answer) {
        await query(
          `UPDATE qa_pairs
           SET question = COALESCE($1, question),
               answer = COALESCE($2, answer),
               status = $3,
               updated_at = NOW()
           WHERE id = $4`,
          [modified_question ?? null, modified_answer ?? null, newStatus, qa_pair_id]
        );
      } else {
        await query(`UPDATE qa_pairs SET status = $1, updated_at = NOW() WHERE id = $2`, [newStatus, qa_pair_id]);
      }
    } else {
      await query(`UPDATE qa_pairs SET status = $1, updated_at = NOW() WHERE id = $2`, [newStatus, qa_pair_id]);
    }

    res.json({ success: true, data: feedbackResult.rows[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'Server error' });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Local API server listening on http://localhost:${port}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`OpenAI Key: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
});
