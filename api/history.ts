// 使用any类型避免TypeScript编译错误
// Vercel会在运行时提供正确的类型
type VercelRequest = any;
type VercelResponse = any;
import { query } from './utils/db.js';

// CORS 处理
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * 历史记录API（兼容现有的getHistory接口）
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // 转换数据格式以兼容前端
    const items = itemsResult.rows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category,
      status: row.status,
      reviewer_score: row.reviewer_score,
      prompt_template_id: row.prompt_template_id,
      created_at: row.created_at?.toISOString() || new Date().toISOString(),
      updated_at: row.updated_at?.toISOString() || new Date().toISOString(),
      reviewed_at: row.reviewed_at?.toISOString() || null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        page_size: pageSizeNum,
        total_pages: totalPages,
      },
    });
  } catch (error: any) {
    console.error('❌ History API错误:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.substring(0, 500)
    });
    
    // 如果是数据库连接错误，提供更详细的错误信息
    if (error.message?.includes('DATABASE_URL') || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({
        error: '数据库连接失败。请检查 DATABASE_URL 环境变量是否正确设置。',
        details: error.message
      });
    }
    
    return res.status(500).json({
      error: error.message || '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

