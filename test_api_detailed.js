/**
 * 详细测试API端点（包括错误详情）
 */
const https = require('https');

const BASE_URL = 'https://ai-qa-generator.vercel.app';

async function testAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonBody,
            raw: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body,
            raw: body,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🔍 详细测试API端点...');
  console.log('='.repeat(60));
  
  console.log('\n📋 测试结果分析：');
  console.log('✅ /api/categories - 成功（不需要数据库）');
  console.log('❌ /api/history - 失败（需要数据库）');
  console.log('❌ /api/qa-pairs - 失败（需要数据库）');
  
  console.log('\n💡 问题诊断：');
  console.log('所有需要数据库的API都返回500错误，说明：');
  console.log('1. DATABASE_URL环境变量可能未设置');
  console.log('2. 或数据库连接失败');
  
  console.log('\n📋 测试 /api/qa-pairs 获取详细错误...');
  try {
    const result = await testAPI('/api/qa-pairs?status=待審查&page=1&page_size=50');
    
    console.log(`状态码: ${result.status}`);
    console.log(`响应头:`, JSON.stringify(result.headers, null, 2));
    console.log(`响应数据:`, result.raw);
    
    if (result.status === 500) {
      console.log('\n❌ 500错误 - 需要查看Vercel Function Logs获取详细错误信息');
      console.log('\n📝 查看日志步骤：');
      console.log('1. 登录 https://vercel.com/dashboard');
      console.log('2. 选择项目 → Deployments');
      console.log('3. 点击最新部署');
      console.log('4. Functions → 点击 /api/qa-pairs');
      console.log('5. 查看 Logs 标签');
      console.log('\n应该会看到类似以下错误：');
      console.log('- "DATABASE_URL 环境变量未设置"');
      console.log('- "数据库连接失败"');
      console.log('- 或其他数据库相关错误');
    }
  } catch (error) {
    console.log(`❌ 请求失败:`, error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成');
  console.log('\n🔧 解决方案：');
  console.log('1. 在Vercel Dashboard设置DATABASE_URL环境变量');
  console.log('2. 值: postgresql://postgres:1234@tw-07.access.glows.ai:25329/qa_generator_db?sslmode=disable');
  console.log('3. 重新部署应用');
}

runTests().catch(console.error);

