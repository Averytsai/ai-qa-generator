"""
生成相關 Schema
"""
from typing import Optional
from pydantic import BaseModel, Field, validator

from app.models.qa_pair import QACategory


class GenerateRequest(BaseModel):
    """生成請求Schema"""
    category: QACategory = Field(..., description="知識領域")
    count: int = Field(..., ge=1, le=100, description="生成數量")
    topic: Optional[str] = Field(None, max_length=200, description="主題關鍵詞")
    style: Optional[str] = Field("专业", description="生成風格")

    @validator('style')
    def validate_style(cls, v):
        """驗證風格選項"""
        valid_styles = ['专业', '通俗', '详细']
        if v not in valid_styles:
            raise ValueError(f'風格必須是: {valid_styles}')
        return v


class GenerateResponse(BaseModel):
    """生成響應Schema"""
    qa_pairs: list[dict]
    total: int
    generation_time: float

