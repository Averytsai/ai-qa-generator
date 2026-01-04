/**
 * 本地诊断脚本 - 检查代码问题
 * 不需要登录Vercel就能检查
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始诊断...\n');

const issues = [];
const warnings = [];

// 1. 检查api目录结构
console.log('1️⃣ 检查API目录结构...');
const apiDir = path.join(__dirname, 'api');
if (!fs.existsSync(apiDir)) {
  issues.push('❌ api目录不存在');
} else {
  console.log('✅ api目录存在');
  
  // 检查关键文件
  const requiredFiles = [
    'categories.ts',
    'qa-pairs.ts',
    'history.ts',
    'generate.ts',
    'review.ts',
    'feedbacks.ts',
    'utils/db.ts',
    'package.json',
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(apiDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file} 存在`);
    } else {
      issues.push(`❌ ${file} 不存在`);
    }
  });
}

// 2. 检查package.json
console.log('\n2️⃣ 检查package.json...');
const packageJsonPath = path.join(apiDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('✅ package.json存在');
  
  const requiredDeps = ['@vercel/node', 'pg', 'openai'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep} 已声明`);
    } else {
      issues.push(`❌ ${dep} 未在dependencies中声明`);
    }
  });
  
  // 检查typescript是否在dependencies中
  if (packageJson.dependencies && packageJson.dependencies['typescript']) {
    console.log('  ✅ typescript 在dependencies中');
  } else {
    warnings.push('⚠️  typescript 不在dependencies中（可能在devDependencies）');
  }
} else {
  issues.push('❌ api/package.json不存在');
}

// 3. 检查TypeScript配置
console.log('\n3️⃣ 检查TypeScript配置...');
const tsconfigPath = path.join(apiDir, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  console.log('✅ tsconfig.json存在');
  
  if (tsconfig.compilerOptions?.moduleResolution === 'bundler') {
    console.log('  ✅ moduleResolution设置为bundler');
  } else {
    warnings.push('⚠️  moduleResolution不是bundler，可能是node16/nodenext');
  }
} else {
  warnings.push('⚠️  api/tsconfig.json不存在');
}

// 4. 检查导入路径
console.log('\n4️⃣ 检查导入路径...');
const checkImports = (filePath, content) => {
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // 检查相对导入是否使用.js扩展名
    const relativeImport = line.match(/from\s+['"]\.\/.*['"]/);
    if (relativeImport) {
      const importPath = relativeImport[0];
      if (importPath.includes('./utils/db') && !importPath.includes('.js')) {
        warnings.push(`⚠️  ${filePath}:${index + 1} - db导入可能缺少.js扩展名`);
      }
    }
    
    // 检查@vercel/node导入
    if (line.includes("@vercel/node")) {
      console.log(`  ✅ ${path.basename(filePath)} 导入了@vercel/node`);
    }
  });
};

const apiFiles = [
  'categories.ts',
  'qa-pairs.ts',
  'history.ts',
  'generate.ts',
  'review.ts',
  'feedbacks.ts',
];

apiFiles.forEach(file => {
  const filePath = path.join(apiDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    checkImports(filePath, content);
  }
});

// 5. 检查vercel.json配置
console.log('\n5️⃣ 检查vercel.json配置...');
const vercelJsonPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  console.log('✅ vercel.json存在');
  
  if (vercelJson.installCommand) {
    console.log(`  ✅ installCommand: ${vercelJson.installCommand}`);
  } else {
    warnings.push('⚠️  vercel.json中没有installCommand');
  }
  
  if (vercelJson.buildCommand) {
    console.log(`  ✅ buildCommand: ${vercelJson.buildCommand}`);
  } else {
    warnings.push('⚠️  vercel.json中没有buildCommand');
  }
  
  // 检查rewrites
  if (vercelJson.rewrites && vercelJson.rewrites.some(r => r.source === '/api/(.*)')) {
    console.log('  ✅ API rewrite规则存在');
  } else {
    issues.push('❌ API rewrite规则缺失');
  }
} else {
  issues.push('❌ vercel.json不存在');
}

// 6. 检查db.ts中的问题
console.log('\n6️⃣ 检查db.ts...');
const dbPath = path.join(apiDir, 'utils', 'db.ts');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  
  // 检查是否在模块加载时创建Pool
  if (dbContent.includes('new Pool(')) {
    console.log('  ✅ Pool在模块加载时创建');
    
    // 检查是否有DATABASE_URL检查
    if (dbContent.includes('process.env.DATABASE_URL')) {
      console.log('  ✅ 检查了DATABASE_URL');
    } else {
      warnings.push('⚠️  db.ts中没有检查DATABASE_URL');
    }
  }
  
  // 检查是否有fetch调用（这些在Vercel中无法工作）
  if (dbContent.includes('fetch(') && dbContent.includes('127.0.0.1')) {
    issues.push('❌ db.ts中包含本地fetch调用，这些在Vercel Functions中无法工作！');
  }
} else {
  issues.push('❌ api/utils/db.ts不存在');
}

// 总结
console.log('\n' + '='.repeat(60));
console.log('📊 诊断结果总结:\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ 未发现明显问题！');
  console.log('\n💡 建议：');
  console.log('  1. 检查Vercel Function Logs获取运行时错误');
  console.log('  2. 确认环境变量（DATABASE_URL）已设置');
  console.log('  3. 检查构建日志中的TypeScript错误');
} else {
  if (issues.length > 0) {
    console.log('❌ 发现严重问题：');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  警告：');
    warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  console.log('\n💡 建议：');
  if (issues.some(i => i.includes('fetch'))) {
    console.log('  1. 移除所有本地fetch调用，改用console.log');
    console.log('  2. 查看Vercel Function Logs获取运行时信息');
  }
  console.log('  3. 修复上述问题后重新部署');
}

console.log('\n' + '='.repeat(60));

