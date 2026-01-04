/**
 * 测试API端点
 */
const https = require('https');

const BASE_URL = 'https://ai-qa-generator.vercel.app';
// const BASE_URL = 'http://localhost:3000'; // 本地测试

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
            raw: body
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
  console.log('🧪 测试API端点...');
  console.log('='.repeat(60));
  
  const tests = [
    {
      name: '测试 /api/categories',
      endpoint: '/api/categories',
      method: 'GET'
    },
    {
      name: '测试 /api/history (无参数)',
      endpoint: '/api/history',
      method: 'GET'
    },
    {
      name: '测试 /api/history (status=已通過)',
      endpoint: '/api/history?status=已通過',
      method: 'GET'
    },
    {
      name: '测试 /api/qa-pairs (status=待審查)',
      endpoint: '/api/qa-pairs?status=待審查&page=1&page_size=50',
      method: 'GET'
    },
    {
      name: '测试 /api/qa-pairs (无参数)',
      endpoint: '/api/qa-pairs',
      method: 'GET'
    },
  ];

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`URL: ${BASE_URL}${test.endpoint}`);
    
    try {
      const result = await testAPI(test.endpoint, test.method);
      
      if (result.status === 200) {
        console.log(`✅ 状态码: ${result.status}`);
        if (result.data.success) {
          console.log(`✅ 成功: ${JSON.stringify(result.data).substring(0, 200)}...`);
        } else {
          console.log(`⚠️  响应: ${JSON.stringify(result.data).substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ 状态码: ${result.status}`);
        console.log(`❌ 错误响应:`, JSON.stringify(result.data, null, 2));
      }
    } catch (error) {
      console.log(`❌ 请求失败:`, error.message);
    }
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成');
}

runTests().catch(console.error);

