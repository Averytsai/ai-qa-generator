/**
 * 数据库设置脚本
 * 执行 schema.sql 创建数据库表结构
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 从环境变量或命令行参数获取数据库连接信息
const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('错误: 请提供 DATABASE_URL 环境变量或作为命令行参数');
  console.error('用法: DATABASE_URL="postgresql://user:password@host:port/database" node setup.js');
  console.error('或: node setup.js "postgresql://user:password@host:port/database"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // 允许自签名证书
  connectionTimeoutMillis: 10000, // 10秒连接超时
  query_timeout: 30000, // 30秒查询超时
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('正在连接到数据库...');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('正在执行SQL脚本...');
    
    // 执行SQL脚本
    await client.query(sql);
    
    console.log('✅ 数据库表结构创建成功！');
    
    // 验证表是否创建成功
    console.log('\n验证表结构...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\n已创建的表:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 检查索引
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY indexname;
    `);
    
    console.log('\n已创建的索引:');
    indexesResult.rows.forEach(row => {
      console.log(`  - ${row.indexname}`);
    });
    
    console.log('\n✅ 数据库设置完成！');
    
  } catch (error) {
    console.error('❌ 执行SQL脚本时出错:');
    console.error(error.message);
    if (error.code) {
      console.error(`错误代码: ${error.code}`);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();

