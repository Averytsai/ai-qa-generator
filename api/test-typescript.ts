/**
 * TypeScript测试函数 - 测试TypeScript编译和@vercel/node导入
 */
// 使用any类型避免TypeScript编译错误
// Vercel会在运行时提供正确的类型
type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[test-typescript] Handler called', { method: req.method, url: req.url });
  
  try {
    return res.status(200).json({
      success: true,
      message: 'TypeScript test function works!',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    });
  } catch (error: any) {
    console.error('[test-typescript] Error:', error);
    return res.status(500).json({
      error: error.message || 'Unknown error',
    });
  }
}

