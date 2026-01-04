/**
 * 最简单的测试函数 - 不导入任何模块
 * 用于诊断Vercel Functions是否能正常运行
 */
// 使用any类型避免TypeScript编译错误
// Vercel会在运行时提供正确的类型
type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[test-simple] Handler called', { method: req.method, url: req.url });
  
  try {
    return res.status(200).json({
      success: true,
      message: 'Simple test function works!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[test-simple] Error:', error);
    return res.status(500).json({
      error: error.message || 'Unknown error',
    });
  }
}

