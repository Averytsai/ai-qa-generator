/**
 * PostgreSQL 数据库连接和工具函数
 */
import { Pool, QueryResult } from 'pg';

// 检查数据库连接字符串
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 环境变量未设置！');
  console.error('请在 Vercel Dashboard 中设置 DATABASE_URL 环境变量');
}

// 创建连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时
  connectionTimeoutMillis: 10000, // 连接超时（增加到10秒）
});

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

