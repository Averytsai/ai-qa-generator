/**
 * 详细测试后端API
 */
const https = require('https');

const BASE_URL = 'https://ai-qa-generator.vercel.app';

function testAPI(endpoint, method = 'GET', data = null) {
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
  console.log('🧪 测试后端API...');
  console.log('='.repeat(60));
  
  const tests = [
    {
      name: '1. /api/categories (不需要数据库)',
      endpoint: '/api/categories',
      expected: 200
    },
    {
      name: '2. /api/qa-pairs (无参数)',
      endpoint: '/api/qa-pairs',
      expected: 200
    },
    {
      name: '3. /api/qa-pairs (status=待審查)',
      endpoint: '/api/qa-pairs?status=待審查&page=1&page_size=50',
      expected: 200
    },
    {
      name: '4. /api/history (无参数)',
      endpoint: '/api/history',
      expected: 200
    },
    {
      name: '5. /api/history (status=已通過)',
      endpoint: '/api/history?status=已通過',
      expected: 200
    },
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`URL: ${BASE_URL}${test.endpoint}`);
    
    try {
      const result = await testAPI(test.endpoint);
      results.push({ ...test, result });
      
      if (result.status === test.expected) {
        console.log(`✅ 状态码: ${result.status} (符合预期)`);
        
        if (result.data.success) {
          console.log(`✅ API返回成功`);
          if (result.data.data) {
            if (result.data.data.items) {
              console.log(`✅ 数据项数量: ${result.data.data.items.length}`);
              console.log(`✅ 总数: ${result.data.data.total || 'N/A'}`);
            } else {
              console.log(`✅ 数据: ${JSON.stringify(result.data.data).substring(0, 100)}...`);
            }
          }
        } else {
          console.log(`⚠️  API返回失败:`, result.data.error || result.data);
        }
      } else {
        console.log(`❌ 状态码: ${result.status} (预期: ${test.expected})`);
        console.log(`❌ 错误响应:`, JSON.stringify(result.data, null, 2).substring(0, 500));
      }
    } catch (error) {
      console.log(`❌ 请求失败:`, error.message);
      results.push({ ...test, error: error.message });
    }
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果总结:');
  
  const success = results.filter(r => r.result?.status === r.expected);
  const failed = results.filter(r => !r.result || r.result.status !== r.expected);
  
  console.log(`\n✅ 成功的API: ${success.length}/${results.length}`);
  success.forEach(r => console.log(`  - ${r.name}`));
  
  if (failed.length > 0) {
    console.log(`\n❌ 失败的API: ${failed.length}/${results.length}`);
    failed.forEach(r => {
      console.log(`  - ${r.name}`);
      if (r.result) {
        console.log(`    状态码: ${r.result.status}`);
        console.log(`    错误: ${JSON.stringify(r.result.data).substring(0, 200)}`);
      } else if (r.error) {
        console.log(`    错误: ${r.error}`);
      }
    });
  }
  
  console.log('\n💡 诊断:');
  if (failed.length === 0) {
    console.log('✅ 所有API测试通过！后端正常工作。');
    console.log('如果前端仍有问题，可能是前端代码或API调用方式的问题。');
  } else {
    const dbApis = failed.filter(r => r.name.includes('qa-pairs') || r.name.includes('history'));
    if (dbApis.length > 0) {
      console.log('❌ 数据库相关API失败，可能原因：');
      console.log('  1. DATABASE_URL环境变量未设置');
      console.log('  2. 数据库连接失败');
      console.log('  3. 数据库表不存在');
      console.log('\n建议：检查Vercel Function Logs获取详细错误信息');
    } else {
      console.log('⚠️  部分API失败，请检查具体错误信息');
    }
  }
}

runTests().catch(console.error);

