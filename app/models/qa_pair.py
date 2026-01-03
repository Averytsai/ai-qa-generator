"""
問答對資料模型
"""
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, String, Text, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.services.database import Base


class QACategory(str, PyEnum):
    """知識領域分類"""
    GENERAL = "通用知識"
    TECHNICAL = "技術流程"
    TROUBLESHOOTING = "故障排除"
    SECURITY = "資安法規"
    CASE_STUDY = "應用案例"


class QAStatus(str, PyEnum):
    """問答對狀態"""
    GENERATING = "生成中"
    PENDING_REVIEW = "待審查"
    REVIEWED = "已審查"
    APPROVED = "已通過"
    REJECTED = "已拒絕"
    MODIFIED = "已修改"


class QAPair(Base):
    """問答對模型"""
    __tablename__ = "qa_pairs"

    # 主鍵
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)

    # 問答內容
    question = Column(Text, nullable=False, comment="問題文本")
    answer = Column(Text, nullable=False, comment="答案文本")

    # 分類和狀態
    category = Column(Enum(QACategory), nullable=False, index=True, comment="知識領域")
    status = Column(Enum(QAStatus), default=QAStatus.PENDING_REVIEW, index=True, comment="狀態")

    # 評分
    generator_score = Column(Integer, nullable=True, comment="生成模組評分 (0-100)")
    reviewer_score = Column(Integer, nullable=True, comment="審查模組評分 (0-100)")

    # 提示詞模板ID（用於追蹤生成時使用的模板）
    prompt_template_id = Column(UUID(as_uuid=True), nullable=True, comment="使用的提示詞模板ID")

    # 時間戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="創建時間")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新時間")
    reviewed_at = Column(DateTime, nullable=True, comment="審查時間")

    # 關聯關係
    reviews = relationship("Review", back_populates="qa_pair", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<QAPair(id={self.id}, category={self.category}, status={self.status})>"

