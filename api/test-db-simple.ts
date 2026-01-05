// 最简单的数据库连接测试
type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[test-db-simple] Handler called');
  
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const info: any = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    };

    // 测试导入pg模块
    try {
      const pg = await import('pg');
      info.pgModuleLoaded = true;
      info.pgModuleType = typeof pg;
      info.hasPool = typeof pg.Pool === 'function';
    } catch (e: any) {
      info.pgModuleError = e.message;
    }

    // 测试导入db模块
    try {
      const dbModule = await import('./utils/db.js');
      info.dbModuleLoaded = true;
      info.hasQueryFunction = typeof dbModule.query === 'function';
    } catch (e: any) {
      info.dbModuleError = e.message;
      info.dbModuleErrorStack = e.stack?.substring(0, 500);
    }

    // 如果db模块加载成功，测试查询
    if (info.hasQueryFunction) {
      try {
        const dbModule = await import('./utils/db.js');
        const result = await dbModule.query('SELECT 1 as test');
        info.queryTestSuccess = true;
        info.queryResult = result.rows[0];
      } catch (e: any) {
        info.queryTestError = e.message;
        info.queryTestErrorCode = e.code;
        info.queryTestErrorStack = e.stack?.substring(0, 500);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Database connection test',
      data: info,
    });
  } catch (error: any) {
    console.error('[test-db-simple] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Test failed',
      stack: error.stack?.substring(0, 500),
    });
  }
}

