"""
審查相關 Schema
"""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.review import ReviewAction


class ReviewRequest(BaseModel):
    """審查請求Schema"""
    qa_pair_id: UUID = Field(..., description="問答對ID")


class ReviewScores(BaseModel):
    """審查評分Schema"""
    accuracy: int = Field(..., ge=0, le=100, description="準確性評分")
    completeness: int = Field(..., ge=0, le=100, description="完整性評分")
    relevance: int = Field(..., ge=0, le=100, description="相關性評分")
    language_quality: int = Field(..., ge=0, le=100, description="語言質量評分")
    domain_fit: int = Field(..., ge=0, le=100, description="領域適配性評分")


class ReviewResponse(BaseModel):
    """審查響應Schema"""
    qa_pair_id: UUID
    reviewer_score: int = Field(..., ge=0, le=100, description="綜合評分")
    scores: ReviewScores
    suggestions: list[str] = Field(default_factory=list, description="改進建議")
    passed: bool = Field(..., description="是否通過審查")
    reviewed_at: str


class BatchReviewRequest(BaseModel):
    """批量審查請求Schema"""
    qa_pair_ids: list[UUID] = Field(..., min_items=1, max_items=50, description="問答對ID列表")


class BatchReviewResponse(BaseModel):
    """批量審查響應Schema"""
    results: list[ReviewResponse]
    summary: dict

