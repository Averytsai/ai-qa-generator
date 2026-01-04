// #region agent log
fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'categories.ts:1',message:'Module loading started',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

import type { VercelRequest, VercelResponse } from '@vercel/node';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'categories.ts:3',message:'@vercel/node imported successfully',data:{hasVercelNode:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

// 分类数据（静态数据）
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'categories.ts:37',message:'Handler function called',data:{method:req.method,url:req.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // CORS 处理
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'categories.ts:45',message:'OPTIONS request handled',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return res.status(200).end();
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'categories.ts:50',message:'Method not allowed',data:{method:req.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'categories.ts:53',message:'Before returning categories',data:{categoriesCount:CATEGORIES.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    return res.status(200).json({
      success: true,
      data: {
        categories: CATEGORIES,
      },
    });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'categories.ts:60',message:'Error caught in handler',data:{error:error.message,stack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('获取分类失败:', error);
    return res.status(500).json({
      error: error.message || '获取分类失败',
    });
  }
}

