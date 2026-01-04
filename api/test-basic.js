/**
 * 最基础的测试函数 - 不使用TypeScript，不使用任何导入
 * 用于诊断Vercel Functions是否能正常运行
 */
module.exports = async function handler(req, res) {
  console.log('[test-basic] Handler called', { method: req.method, url: req.url });
  
  try {
    return res.status(200).json({
      success: true,
      message: 'Basic test function works!',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    });
  } catch (error) {
    console.error('[test-basic] Error:', error);
    return res.status(500).json({
      error: error.message || 'Unknown error',
    });
  }
};

