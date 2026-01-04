/**
 * 测试直接PostgreSQL连接（不使用连接池）
 */
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@tw-07.access.glows.ai:23793/qa_generator_db?sslmode=require';

console.log('🔍 测试直接PostgreSQL连接...');
console.log('连接字符串:', DATABASE_URL.replace(/password:[^@]+@/, 'password:***@'));

// 解析连接字符串
const url = new URL(DATABASE_URL);
const sslMode = url.searchParams.get('sslmode') || 'prefer';

let sslConfig = false;
if (sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full') {
  sslConfig = { rejectUnauthorized: false };
} else if (sslMode === 'prefer') {
  sslConfig = { rejectUnauthorized: false };
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: sslConfig,
  connectionTimeoutMillis: 10000,
});

async function testDirectConnection() {
  try {
    console.log('\n📋 尝试连接...');
    await client.connect();
    console.log('✅ 连接成功！');
    
    console.log('\n📋 测试查询...');
    const result = await client.query('SELECT version(), current_database(), current_user;');
    console.log('✅ 查询成功！');
    console.log('结果:', result.rows[0]);
    
    console.log('\n📋 检查表...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log('表:', tablesResult.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    console.log('\n✅ 所有测试通过！');
    
  } catch (error) {
    console.error('\n❌ 连接失败:');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误详情:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 连接被拒绝，可能是：');
      console.error('  1. PostgreSQL服务未运行');
      console.error('  2. 端口不正确');
      console.error('  3. 防火墙阻止');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 提示: 连接超时，可能是：');
      console.error('  1. 网络连接问题');
      console.error('  2. 防火墙阻止');
      console.error('  3. 端口转发未正确配置');
    } else if (error.message?.includes('password authentication failed')) {
      console.error('\n💡 提示: 密码认证失败，请检查用户名和密码');
    } else if (error.message?.includes('database') && error.message?.includes('does not exist')) {
      console.error('\n💡 提示: 数据库不存在，请检查数据库名称');
    }
    
    process.exit(1);
  }
}

testDirectConnection();

