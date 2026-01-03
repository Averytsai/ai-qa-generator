/**
 * API客戶端服務
 */
import axios from 'axios';
import type {
  QAPair,
  Category,
  GenerateRequest,
  ReviewResponse,
  FeedbackSubmitRequest,
  ApiResponse,
  QACategory,
  QAStatus,
} from '../types';

const API_BASE_URL = '/api/v1';

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:28',message:'Request interceptor - before send',data:{method:config.method,url:config.url,baseURL:config.baseURL,data:config.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return config;
  },
  (error) => {
    console.error('API請求錯誤：', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:32',message:'Request interceptor error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
    console.log('分類API原始響應：', response);
    
    // API響應攔截器已經返回了response.data，所以response就是後端返回的完整數據
    // 後端返回格式：{ success: true, data: { categories: [...] } }
    // 所以response = { success: true, data: { categories: [...] } }
    if (response?.data?.categories && Array.isArray(response.data.categories)) {
      console.log('從response.data.categories獲取分類：', response.data.categories);
      return response.data.categories;
    }
    
    // 如果數據結構不同，嘗試其他路徑
    if (Array.isArray(response?.categories)) {
      console.log('從response.categories獲取分類：', response.categories);
      return response.categories;
    }
    
    // 如果response本身就是數組（向後兼容）
    if (Array.isArray(response)) {
      console.log('response本身就是數組：', response);
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:79',message:'generatorApi.generate - before call',data:{request},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    try {
      const result = await api.post('/generator/generate', request);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:82',message:'generatorApi.generate - success',data:{resultType:typeof result,resultKeys:result?Object.keys(result):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return result;
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c43600db-e18f-4100-af93-79b30b6f97fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:87',message:'generatorApi.generate - catch error',data:{errorMessage:error.message,errorResponse:error.response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  },

  /**
   * 獲取生成歷史
   */
  getHistory: async (params?: {
    category?: QACategory;
    status?: QAStatus;
    page?: number;
    page_size?: number;
  }): Promise<{ items: QAPair[]; total: number; page: number; page_size: number; total_pages: number }> => {
    return await api.get('/generator/history', { params });
  },
};

/**
 * 審查API
 */
export const reviewerApi = {
  /**
   * 審查單個問答對
   */
  review: async (qaPairId: string): Promise<ReviewResponse> => {
    return await api.post('/reviewer/review', { qa_pair_id: qaPairId });
  },

  /**
   * 批量審查
   */
  batchReview: async (qaPairIds: string[]) => {
    return await api.post('/reviewer/batch-review', { qa_pair_ids: qaPairIds });
  },
};

/**
 * 反饋API
 */
export const feedbackApi = {
  /**
   * 提交反饋
   */
  submit: async (request: FeedbackSubmitRequest) => {
    return await api.post('/feedback/submit', request);
  },

  /**
   * 獲取待審查列表
   */
  getPending: async (params?: {
    category?: QACategory;
    page?: number;
    page_size?: number;
  }): Promise<{ items: QAPair[]; total: number; page: number; page_size: number; total_pages: number }> => {
    return await api.get('/feedback/pending', { params });
  },
};

export default api;

