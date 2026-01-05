/**
 * Categories API - JavaScript版本
 * 用于测试是否TypeScript是问题根源
 */
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
  {
    id: '故障排除',
    name: '故障排除',
    description: '常見問題、解決方案',
    qa_count: 0,
  },
  {
    id: '安全合規',
    name: '安全合規',
    description: '安全規範、合規要求',
    qa_count: 0,
  },
  {
    id: '案例分享',
    name: '案例分享',
    description: '實際應用、案例分享',
    qa_count: 0,
  },
];

module.exports = async function handler(req, res) {
  console.log('[categories.js] Handler called', { method: req.method, url: req.url });
  
  try {
    // CORS 处理
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 只允许 GET 请求
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
    console.error('[categories.js] Error:', error);
    return res.status(500).json({
      error: error.message || '获取分类失败',
    });
  }
};

