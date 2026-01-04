/**
 * 测试新的数据库凭据
 */
const { Client } = require('pg');

// 测试不同的连接方式
const testConfigs = [
  {
    name: '使用5432端口（如果已开放）',
    url: 'postgresql://postgres:1234@tw-07.access.glows.ai:5432/qa_generator_db',
  },
  {
    name: '使用23793端口（如果转发到5432）',
    url: 'postgresql://postgres:1234@tw-07.access.glows.ai:23793/qa_generator_db',
  },
  {
    name: '使用postgres数据库',
    url: 'postgresql://postgres:1234@tw-07.access.glows.ai:5432/postgres',
  },
];

async function testConnection(config) {
  const { name, url } = config;
  console.log(`\n🔍 测试: ${name}`);
  console.log(`连接字符串: ${url.replace(/password:[^@]+@/, 'password:***@')}`);
  
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  
  try {
    await client.connect();
    console.log(`✅ ${name} - 连接成功！`);
    
    const result = await client.query('SELECT version(), current_database();');
    console.log(`✅ 数据库: ${result.rows[0].current_database}`);
    console.log(`✅ 版本: ${result.rows[0].version.substring(0, 50)}`);
    
    // 检查qa_generator_db是否存在
    if (result.rows[0].current_database === 'postgres') {
      const dbCheck = await client.query("SELECT datname FROM pg_database WHERE datname = 'qa_generator_db';");
      if (dbCheck.rows.length > 0) {
        console.log(`✅ qa_generator_db数据库存在`);
      } else {
        console.log(`⚠️  qa_generator_db数据库不存在，需要创建`);
      }
    }
    
    await client.end();
    return { success: true, name, url };
  } catch (error) {
    console.error(`❌ ${name} - 连接失败:`, error.message);
    if (error.code) {
      console.error(`   错误代码: ${error.code}`);
    }
    return { success: false, name, url, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 测试新的数据库凭据...');
  console.log('='.repeat(60));
  
  const results = [];
  for (const config of testConfigs) {
    const result = await testConnection(config);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果总结:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('\n✅ 成功的配置:');
    successful.forEach(r => {
      console.log(`  - ${r.name}`);
      console.log(`    连接字符串: ${r.url.replace(/password:[^@]+@/, 'password:***@')}`);
    });
    console.log('\n💡 建议使用第一个成功的配置作为DATABASE_URL');
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 失败的配置:');
    failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }
  
  if (successful.length === 0) {
    console.log('\n⚠️  所有外部连接都失败了');
    console.log('可能原因：');
    console.log('  1. 端口5432还未对外开放');
    console.log('  2. 端口转发还未配置或生效');
    console.log('  3. 防火墙阻止了连接');
    console.log('\n建议：');
    console.log('  1. 确认端口转发配置已生效');
    console.log('  2. 检查防火墙规则');
    console.log('  3. 或使用SSH隧道进行本地测试');
  }
}

runTests().catch(console.error);

