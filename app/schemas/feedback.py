"""
反饋相關 Schema
"""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.review import ReviewAction


class FeedbackSubmitRequest(BaseModel):
    """提交反饋請求Schema"""
    qa_pair_id: UUID = Field(..., description="問答對ID")
    action: ReviewAction = Field(..., description="操作類型")
    modified_question: Optional[str] = Field(None, description="修改後的問題")
    modified_answer: Optional[str] = Field(None, description="修改後的答案")
    feedback_categories: Optional[list[str]] = Field(None, description="反饋分類")
    review_reason: Optional[str] = Field(None, description="審查原因")


class FeedbackSubmitResponse(BaseModel):
    """提交反饋響應Schema"""
    feedback_id: UUID
    qa_pair_id: UUID
    status: str
    submitted_at: str

