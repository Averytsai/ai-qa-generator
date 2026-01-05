/**
 * 前端类型定义
 */

export enum QACategory {
  GENERAL = "通用知識",
  TECHNICAL = "技術流程",
  TROUBLESHOOTING = "故障排除",
  SECURITY = "資安法規",
  CASE_STUDY = "應用案例",
}

export enum QAStatus {
  GENERATING = "生成中",
  PENDING_REVIEW = "待審查",
  REVIEWED = "AI已審查",
  APPROVED = "已通過",
  REJECTED = "已拒絕",
  MODIFIED = "已修改",
}

export enum ReviewAction {
  APPROVE = "approve",
  MODIFY = "modify",
  REJECT = "reject",
}

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: QACategory;
  status: QAStatus;
  reviewer_score: number | null;
  prompt_template_id: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  qa_count: number;
}

export interface GenerateRequest {
  category: QACategory;
  count: number;
  topic?: string;
  style?: string;
}

export interface ReviewScores {
  accuracy: number;
  completeness: number;
  relevance: number;
  language_quality: number;
  domain_fit: number;
}

export interface ReviewResponse {
  qa_pair_id: string;
  reviewer_score: number;
  scores: ReviewScores;
  suggestions: string[];
  passed: boolean;
  reviewed_at: string;
}

export interface FeedbackSubmitRequest {
  qa_pair_id: string;
  action: ReviewAction;
  modified_question?: string;
  modified_answer?: string;
  feedback_categories?: string[];
  review_reason?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

