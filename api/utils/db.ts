/**
 * PostgreSQL 数据库连接和工具函数
 */
// #region agent log
fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.ts:1',message:'db.ts module loading',data:{hasDatabaseUrl:!!process.env.DATABASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion

import { Pool, QueryResult } from 'pg';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.ts:5',message:'pg module imported',data:{hasPg:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

// 检查数据库连接字符串
if (!process.env.DATABASE_URL) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.ts:9',message:'DATABASE_URL not set',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  console.error('❌ DATABASE_URL 环境变量未设置！');
  console.error('请在 Vercel Dashboard 中设置 DATABASE_URL 环境变量');
}

// 解析连接字符串，根据sslmode调整SSL配置
const getSSLConfig = () => {
  if (!process.env.DATABASE_URL) return false;
  
  try {
    const url = new URL(process.env.DATABASE_URL);
    const sslMode = url.searchParams.get('sslmode') || 'prefer';
    
    // 根据sslmode决定SSL配置
    if (sslMode === 'disable') {
      return false;
    } else if (sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full') {
      // require模式：使用SSL，但不验证证书（因为可能是自签名证书）
      return { rejectUnauthorized: false };
    } else if (sslMode === 'prefer' || sslMode === 'allow') {
      // prefer/allow模式：先尝试SSL，失败则使用非SSL
      // 对于自签名证书，设置为不验证
      return { rejectUnauthorized: false };
    }
  } catch (error) {
    // 如果URL解析失败，使用默认配置
    console.warn('Failed to parse DATABASE_URL:', error);
  }
  
  // 默认：根据环境决定
  return process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false;
};

// 创建连接池
// #region agent log
fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.ts:42',message:'Before creating pool',data:{hasDatabaseUrl:!!process.env.DATABASE_URL,sslConfig:getSSLConfig()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSSLConfig(),
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时
  connectionTimeoutMillis: 15000, // 连接超时（增加到15秒）
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// #region agent log
fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.ts:51',message:'Pool created successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
// #endregion

/**
 * 执行SQL查询
 */
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  
  // 检查数据库连接字符串
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL 环境变量未设置。请在 Vercel Dashboard 的 Environment Variables 中设置 DATABASE_URL。');
    console.error('❌', error.message);
    throw error;
  }
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.error('❌ Database query error', { 
      error: error.message, 
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      query: text.substring(0, 200)
    });
    throw error;
  }
}

/**
 * 获取客户端（用于事务）
 */
export async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // 设置超时
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // 重写release方法
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  
  return client;
}

export { pool };

