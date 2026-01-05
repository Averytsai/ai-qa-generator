// 测试数据库连接的简单函数
type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[test-db-connection] Handler called');
  
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 测试导入db模块
    console.log('[test-db-connection] Before importing db.js');
    const { query } = await import('./utils/db.js');
    console.log('[test-db-connection] db.js imported successfully', { hasQuery: typeof query === 'function' });

    // 测试数据库连接
    console.log('[test-db-connection] Before database query');
    const result = await query('SELECT 1 as test');
    console.log('[test-db-connection] Database query successful', { rows: result.rows });

    return res.status(200).json({
      success: true,
      message: 'Database connection test successful',
      data: {
        test: result.rows[0],
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    });
  } catch (error: any) {
    console.error('[test-db-connection] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Database connection test failed',
      stack: error.stack?.substring(0, 500),
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
  }
}

