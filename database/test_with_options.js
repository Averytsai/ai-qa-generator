/**
 * 测试不同连接选项
 */
const { Client } = require('pg');

const baseUrl = 'postgresql://user:password@tw-07.access.glows.ai:23793/qa_generator_db';

const testConfigs = [
  { name: '禁用SSL', url: `${baseUrl}?sslmode=disable` },
  { name: '允许SSL', url: `${baseUrl}?sslmode=allow` },
  { name: '偏好SSL', url: `${baseUrl}?sslmode=prefer` },
  { name: '要求SSL', url: `${baseUrl}?sslmode=require` },
  { name: '无SSL配置', url: baseUrl },
];

async function testConnection(config) {
  const { name, url } = config;
  console.log(`\n🔍 测试: ${name}`);
  console.log(`连接字符串: ${url.replace(/password:[^@]+@/, 'password:***@')}`);
  
  const urlObj = new URL(url);
  const sslMode = urlObj.searchParams.get('sslmode') || 'prefer';
  
  let sslConfig = false;
  if (sslMode === 'disable') {
    sslConfig = false;
  } else if (sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full') {
    sslConfig = { rejectUnauthorized: false };
  } else if (sslMode === 'prefer' || sslMode === 'allow') {
    sslConfig = { rejectUnauthorized: false };
  }
  
  const client = new Client({
    connectionString: url,
    ssl: sslConfig,
    connectionTimeoutMillis: 15000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });
  
  try {
    await client.connect();
    console.log(`✅ ${name} - 连接成功！`);
    
    const result = await client.query('SELECT version();');
    console.log(`✅ ${name} - 查询成功:`, result.rows[0].version.substring(0, 50));
    
    await client.end();
    return { success: true, name };
  } catch (error) {
    console.error(`❌ ${name} - 连接失败:`, error.message);
    if (error.code) {
      console.error(`   错误代码: ${error.code}`);
    }
    return { success: false, name, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 测试不同的SSL配置...');
  console.log('='.repeat(60));
  
  const results = [];
  for (const config of testConfigs) {
    const result = await testConnection(config);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果总结:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('\n✅ 成功的配置:');
    successful.forEach(r => console.log(`  - ${r.name}`));
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 失败的配置:');
    failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }
  
  if (successful.length === 0) {
    console.log('\n⚠️  所有配置都失败了，可能需要检查：');
    console.log('  1. 端口转发是否正确配置');
    console.log('  2. PostgreSQL服务是否正常运行');
    console.log('  3. 防火墙规则');
    console.log('  4. 网络连接');
  }
}

runTests().catch(console.error);

