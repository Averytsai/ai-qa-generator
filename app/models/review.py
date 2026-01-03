"""
審查記錄資料模型
"""
from datetime import datetime
from enum import Enum as PyEnum
from uuid import uuid4

from sqlalchemy import Column, String, Text, Integer, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.services.database import Base


class ReviewAction(str, PyEnum):
    """審查操作類型"""
    APPROVE = "approve"  # 通過
    MODIFY = "modify"    # 修改
    REJECT = "reject"    # 拒絕


class Review(Base):
    """審查記錄模型"""
    __tablename__ = "reviews"

    # 主鍵
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)

    # 關聯問答對
    qa_pair_id = Column(UUID(as_uuid=True), ForeignKey("qa_pairs.id"), nullable=False, index=True)

    # 審查人（暫時用字符串，後續可改為關聯用戶表）
    reviewer_id = Column(String(100), nullable=True, comment="審查人ID")

    # 審查操作
    action = Column(Enum(ReviewAction), nullable=False, comment="操作類型")

    # 修改後的內容（如果action=modify）
    modified_question = Column(Text, nullable=True, comment="修改後的問題")
    modified_answer = Column(Text, nullable=True, comment="修改後的答案")

    # 反饋信息
    feedback = Column(Text, nullable=True, comment="反饋意見")
    review_reason = Column(Text, nullable=True, comment="審查原因")

    # 反饋分類（JSON格式存儲）
    feedback_categories = Column(JSON, nullable=True, comment="反饋分類列表")

    # 時間戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="創建時間")

    # 關聯關係
    qa_pair = relationship("QAPair", back_populates="reviews")

    def __repr__(self):
        return f"<Review(id={self.id}, qa_pair_id={self.qa_pair_id}, action={self.action})>"

