"""
問答對 Pydantic Schema
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.qa_pair import QACategory, QAStatus


class QAPairBase(BaseModel):
    """問答對基礎Schema"""
    question: str = Field(..., description="問題文本")
    answer: str = Field(..., description="答案文本")
    category: QACategory = Field(..., description="知識領域")


class QAPairCreate(QAPairBase):
    """創建問答對Schema"""
    pass


class QAPairUpdate(BaseModel):
    """更新問答對Schema"""
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[QACategory] = None
    status: Optional[QAStatus] = None


class QAPairResponse(QAPairBase):
    """問答對響應Schema"""
    id: UUID
    status: QAStatus
    reviewer_score: Optional[int] = None
    prompt_template_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QAPairListResponse(BaseModel):
    """問答對列表響應Schema"""
    items: list[QAPairResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

