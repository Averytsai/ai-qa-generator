/**
 * 测试categories的JavaScript版本
 * 用于对比TypeScript版本
 */
module.exports = async function handler(req, res) {
  console.log('[test-categories-simple] Handler called', { method: req.method, url: req.url });
  
  const CATEGORIES = [
    {
      id: '通用知識',
      name: '通用知識',
      description: '基礎概念、常識性內容',
      qa_count: 0,
    },
    {
      id: '技術規範',
      name: '技術規範',
      description: '技術規範、操作流程',
      qa_count: 0,
    },
  ];

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(200).json({
      success: true,
      data: {
        categories: CATEGORIES,
      },
    });
  } catch (error) {
    console.error('[test-categories-simple] Error:', error);
    return res.status(500).json({
      error: error.message || 'Unknown error',
    });
  }
};

