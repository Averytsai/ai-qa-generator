/**
 * API客戶端服務
 */
import axios from 'axios';
import type {
  QAPair,
  Category,
  GenerateRequest,
  FeedbackSubmitRequest,
  QACategory,
  QAStatus,
} from '../types';
import { QAStatus as QAStatusEnum, ReviewAction } from '../types';

// 使用 Vercel Functions（相对路径）
// 开发环境：Vite 代理到本地（如果需要本地测试）
// 生产环境：直接调用 Vercel Functions
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    console.log('API請求：', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API請求錯誤：', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('API響應：', response.status, response.data);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:40',message:'Response interceptor - success',data:{status:response.status,statusText:response.statusText,headers:JSON.stringify(response.headers),dataType:typeof response.data,dataKeys:response.data?Object.keys(response.data):null,dataPreview:JSON.stringify(response.data).substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return response.data;
  },
  (error) => {
    console.error('API響應錯誤：', error.response?.status, error.response?.data);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:44',message:'Response interceptor - error',data:{status:error.response?.status,statusText:error.response?.statusText,headers:JSON.stringify(error.response?.headers),dataType:typeof error.response?.data,data:error.response?.data,message:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // 保留完整的錯誤對象，以便前端可以訪問error.response
    const apiError: any = new Error(error.response?.data?.detail || error.message || '請求失敗');
    apiError.response = error.response;
    return Promise.reject(apiError);
  }
);

/**
 * 分類API
 */
export const categoryApi = {
  /**
   * 獲取所有分類
   */
  getCategories: async (): Promise<Category[]> => {
    const response: any = await api.get('/categories');
    
    // Vercel Functions 返回格式：{ success: true, data: { categories: [...] } }
    if (response?.data?.categories && Array.isArray(response.data.categories)) {
      return response.data.categories;
    }
    
    // 向后兼容
    if (Array.isArray(response?.categories)) {
      return response.categories;
    }
    
    if (Array.isArray(response)) {
      return response;
    }
    
    console.warn('無法解析分類數據，響應結構：', response);
    return [];
  },

  /**
   * 獲取分類統計
   */
  getCategoryStats: async (categoryId: string) => {
    return await api.get(`/categories/${categoryId}/stats`);
  },
};

/**
 * 生成API
 */
export const generatorApi = {
  /**
   * 生成問答對
   */
  generate: async (request: GenerateRequest) => {
    try {
      const result = await api.post('/generate', request);
      return result;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * 獲取生成歷史（前端本地存储）
   */
  getHistory: async (params?: {
    category?: QACategory;
    status?: QAStatus;
    page?: number;
    page_size?: number;
  }): Promise<{ items: QAPair[]; total: number; page: number; page_size: number; total_pages: number }> => {
    // 从 localStorage 读取历史记录
    const stored = localStorage.getItem('qa_history');
    let allItems: QAPair[] = stored ? JSON.parse(stored) : [];
    
    // 过滤
    if (params?.category) {
      allItems = allItems.filter(item => item.category === params.category);
    }
    if (params?.status) {
      const statusFilter = params.status as any;
      allItems = allItems.filter(item => {
        const itemStatus = item.status as any;
        // 支持多种状态格式比较
        if (itemStatus === statusFilter) {
          return true;
        }
        // 字符串比较
        if (String(itemStatus) === String(statusFilter)) {
          return true;
        }
        // 枚举值比较
        if (statusFilter === QAStatusEnum.APPROVED) {
          return itemStatus === QAStatusEnum.APPROVED ||
                 itemStatus === '已通過' ||
                 itemStatus === 'approved' ||
                 String(itemStatus).toLowerCase() === 'approved';
        }
        if (statusFilter === QAStatusEnum.REJECTED) {
          return itemStatus === QAStatusEnum.REJECTED ||
                 itemStatus === '已拒絕' ||
                 itemStatus === 'rejected' ||
                 String(itemStatus).toLowerCase() === 'rejected';
        }
        if (statusFilter === QAStatusEnum.MODIFIED) {
          return itemStatus === QAStatusEnum.MODIFIED ||
                 itemStatus === '已修改' ||
                 itemStatus === 'modified' ||
                 String(itemStatus).toLowerCase() === 'modified';
        }
        return false;
      });
    }
    
    // 分页
    const page = params?.page || 1;
    const pageSize = params?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = allItems.slice(start, end);
    
    return {
      items,
      total: allItems.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(allItems.length / pageSize),
    };
  },
};

/**
 * 審查API
 */
export const reviewerApi = {
  /**
   * 審查單個問答對
   */
  review: async (qaPair: { id: string; question: string; answer: string }): Promise<any> => {
    const response: any = await api.post('/review', {
      qa_pair_id: qaPair.id,
      question: qaPair.question,
      answer: qaPair.answer,
    });
    // API 返回格式：{ success: true, data: {...} }
    // 响应拦截器已经返回了 response.data，所以 response 就是 { success: true, data: {...} }
    // 返回 data 部分，如果没有 data 则直接返回 response
    return (response && typeof response === 'object' && 'data' in response) ? response.data : response;
  },

  /**
   * 批量審查（逐个调用）
   */
  batchReview: async (qaPairs: Array<{ id: string; question: string; answer: string }>) => {
    const results = await Promise.all(
      qaPairs.map(qaPair => reviewerApi.review(qaPair))
    );
    return {
      success: true,
      data: {
        reviews: results,
        total: results.length,
        passed: results.filter(r => r.passed).length,
      },
    };
  },
};

/**
 * 反饋API
 */
export const feedbackApi = {
  /**
   * 提交反饋（前端本地存储）
   */
  submit: async (request: FeedbackSubmitRequest) => {
    // 保存反馈到 localStorage
    const stored = localStorage.getItem('qa_feedback');
    const feedbacks = stored ? JSON.parse(stored) : [];
    feedbacks.push({
      ...request,
      id: `feedback-${Date.now()}`,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('qa_feedback', JSON.stringify(feedbacks));
    
    // 更新 qa_history 中对应项的状态
    const historyStored = localStorage.getItem('qa_history');
    if (historyStored) {
      const history: QAPair[] = JSON.parse(historyStored);
      const index = history.findIndex(item => item.id === request.qa_pair_id);
      
      if (index !== -1) {
        const updatedItem = { ...history[index] };
        
        // 根据操作类型更新状态和内容
        const action = request.action as any;
        if (action === 'approve' || action === ReviewAction.APPROVE) {
          updatedItem.status = QAStatusEnum.APPROVED;
        } else if (action === 'reject' || action === ReviewAction.REJECT) {
          updatedItem.status = QAStatusEnum.REJECTED;
        } else if (action === 'modify' || action === ReviewAction.MODIFY) {
          // 修改后，视为已通过人工审查，状态设为 APPROVED，可以加入知识库
          updatedItem.status = QAStatusEnum.APPROVED;
          if (request.modified_question) {
            updatedItem.question = request.modified_question;
          }
          if (request.modified_answer) {
            updatedItem.answer = request.modified_answer;
          }
        }
        
        updatedItem.updated_at = new Date().toISOString();
        history[index] = updatedItem;
        localStorage.setItem('qa_history', JSON.stringify(history));
      }
    }
    
    return {
      success: true,
      data: {
        feedback_id: `feedback-${Date.now()}`,
        message: '反馈已提交',
      },
    };
  },

  /**
   * 獲取待審查列表（从本地存储）
   */
  getPending: async (params?: {
    category?: QACategory;
    page?: number;
    page_size?: number;
  }): Promise<{ items: QAPair[]; total: number; page: number; page_size: number; total_pages: number }> => {
    const stored = localStorage.getItem('qa_history');
    let allItems: QAPair[] = stored ? JSON.parse(stored) : [];
    
    // 只返回 pending 状态的
    allItems = allItems.filter(item => {
      const status = item.status as any;
      return status === QAStatusEnum.PENDING_REVIEW || 
             status === 'pending' || 
             status === '待審查' ||
             String(status) === 'pending';
    });
    
    // 过滤
    if (params?.category) {
      allItems = allItems.filter(item => item.category === params.category);
    }
    
    // 分页
    const page = params?.page || 1;
    const pageSize = params?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = allItems.slice(start, end);
    
    return {
      items,
      total: allItems.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(allItems.length / pageSize),
    };
  },
};

export default api;

