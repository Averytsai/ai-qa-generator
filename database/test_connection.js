/**
 * 测试数据库连接脚本
 */
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require';

console.log('🔍 测试数据库连接...');
console.log('连接字符串:', DATABASE_URL.replace(/password:[^@]+@/, 'password:***@')); // 隐藏密码

// 解析连接字符串，根据sslmode调整SSL配置
const url = new URL(DATABASE_URL);
const sslMode = url.searchParams.get('sslmode') || 'prefer';

let sslConfig = false;
if (sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full') {
  sslConfig = { rejectUnauthorized: false };
} else if (sslMode === 'prefer') {
  // prefer模式：先尝试SSL，失败则使用非SSL
  sslConfig = { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: sslConfig,
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
  statement_timeout: 30000,
});

async function testConnection() {
  const client = await pool.connect();
  
  try {
    console.log('✅ 数据库连接成功！\n');
    
    // 测试1: 检查表是否存在
    console.log('📋 测试1: 检查表结构...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('已创建的表:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    if (tablesResult.rows.length === 0) {
      console.log('  ⚠️  没有找到表，可能需要执行 schema.sql');
    }
    
    // 测试2: 检查 qa_pairs 表结构
    console.log('\n📋 测试2: 检查 qa_pairs 表结构...');
    const qaPairsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'qa_pairs'
      ORDER BY ordinal_position;
    `);
    
    if (qaPairsColumns.rows.length > 0) {
      console.log('qa_pairs 表字段:');
      qaPairsColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('  ⚠️  qa_pairs 表不存在');
    }
    
    // 测试3: 检查 feedbacks 表结构
    console.log('\n📋 测试3: 检查 feedbacks 表结构...');
    const feedbacksColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'feedbacks'
      ORDER BY ordinal_position;
    `);
    
    if (feedbacksColumns.rows.length > 0) {
      console.log('feedbacks 表字段:');
      feedbacksColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('  ⚠️  feedbacks 表不存在');
    }
    
    // 测试4: 测试插入和查询
    console.log('\n📋 测试4: 测试插入和查询...');
    const testQuestion = '测试问题 ' + Date.now();
    const testAnswer = '测试答案';
    
    const insertResult = await client.query(`
      INSERT INTO qa_pairs (question, answer, category, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, question, answer, category, status, created_at;
    `, [testQuestion, testAnswer, '通用知識', '待審查']);
    
    const insertedId = insertResult.rows[0].id;
    console.log('✅ 插入测试数据成功:');
    console.log(`  ID: ${insertedId}`);
    console.log(`  问题: ${insertResult.rows[0].question}`);
    console.log(`  答案: ${insertResult.rows[0].answer}`);
    console.log(`  分类: ${insertResult.rows[0].category}`);
    console.log(`  状态: ${insertResult.rows[0].status}`);
    
    // 查询刚插入的数据
    const selectResult = await client.query(`
      SELECT * FROM qa_pairs WHERE id = $1;
    `, [insertedId]);
    
    if (selectResult.rows.length > 0) {
      console.log('\n✅ 查询测试数据成功');
    } else {
      console.log('\n⚠️  查询测试数据失败');
    }
    
    // 清理测试数据
    await client.query('DELETE FROM qa_pairs WHERE id = $1;', [insertedId]);
    console.log('✅ 已清理测试数据');
    
    // 测试5: 统计现有数据
    console.log('\n📋 测试5: 统计现有数据...');
    const countResult = await client.query('SELECT COUNT(*) as total FROM qa_pairs;');
    console.log(`总问答对数量: ${countResult.rows[0].total}`);
    
    const statusCountResult = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM qa_pairs 
      GROUP BY status 
      ORDER BY count DESC;
    `);
    
    if (statusCountResult.rows.length > 0) {
      console.log('按状态统计:');
      statusCountResult.rows.forEach(row => {
        console.log(`  ${row.status}: ${row.count}`);
      });
    }
    
    console.log('\n✅ 所有测试通过！数据库连接正常。');
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    if (error.detail) {
      console.error('详细信息:', error.detail);
    }
    if (error.hint) {
      console.error('提示:', error.hint);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection().catch(error => {
  console.error('❌ 连接失败:', error.message);
  console.error('错误代码:', error.code);
  if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 提示: 数据库服务器拒绝连接，可能是：');
    console.error('  1. 数据库服务器未运行');
    console.error('  2. 防火墙阻止了连接');
    console.error('  3. 连接地址或端口错误');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('\n💡 提示: 连接超时，可能是：');
    console.error('  1. 网络连接问题');
    console.error('  2. 防火墙阻止了连接');
    console.error('  3. 数据库服务器无法访问');
  } else if (error.message?.includes('password authentication failed')) {
    console.error('\n💡 提示: 密码认证失败，请检查用户名和密码');
  } else if (error.message?.includes('database') && error.message?.includes('does not exist')) {
    console.error('\n💡 提示: 数据库不存在，请检查数据库名称');
  }
  process.exit(1);
});

