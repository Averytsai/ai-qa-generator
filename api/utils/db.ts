/**
 * PostgreSQL 数据库连接和工具函数
 */
// #region agent log
console.log('[db.ts] Module loading started', { hasDatabaseUrl: !!process.env.DATABASE_URL });
// #endregion

import { Pool, QueryResult } from 'pg';

// #region agent log
console.log('[db.ts] pg module imported successfully');
// #endregion

// 检查数据库连接字符串
if (!process.env.DATABASE_URL) {
  // #region agent log
  console.error('[db.ts] DATABASE_URL not set');
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
console.log('[db.ts] Before creating pool', { hasDatabaseUrl: !!process.env.DATABASE_URL, sslConfig: getSSLConfig() });
// #endregion

// 延迟创建连接池，避免模块加载时失败
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getSSLConfig(),
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲连接超时
      connectionTimeoutMillis: 15000, // 连接超时（增加到15秒）
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });
  }
  return pool;
}

// 连接池将在第一次使用时创建

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
    const poolInstance = getPool();
    const res = await poolInstance.query(text, params);
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
  const poolInstance = getPool();
  const client = await poolInstance.connect();
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

// 导出pool对象，提供与Pool相同的接口
export const pool = {
  query: (text: string, params?: any[]) => {
    return getPool().query(text, params);
  },
  connect: () => {
    return getPool().connect();
  },
  end: async () => {
    if (pool) {
      const poolInstance = getPool();
      return poolInstance.end();
    }
    return Promise.resolve();
  },
};

