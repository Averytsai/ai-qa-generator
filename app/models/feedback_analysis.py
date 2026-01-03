"""
反饋分析資料模型
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.models.qa_pair import QACategory
from app.services.database import Base


class FeedbackAnalysis(Base):
    """反饋分析模型"""
    __tablename__ = "feedback_analysis"

    # 主鍵
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)

    # 分析範圍
    category = Column(Enum(QACategory), nullable=False, index=True, comment="知識領域")
    analysis_period_start = Column(DateTime, nullable=False, comment="分析開始時間")
    analysis_period_end = Column(DateTime, nullable=False, comment="分析結束時間")

    # 分析結果
    common_issues = Column(JSON, nullable=True, comment="常見問題（JSON格式）")
    optimization_suggestions = Column(JSON, nullable=True, comment="優化建議（JSON格式）")
    statistics = Column(JSON, nullable=True, comment="統計數據（JSON格式）")

    # 時間戳
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="分析時間")

    def __repr__(self):
        return f"<FeedbackAnalysis(id={self.id}, category={self.category}, analyzed_at={self.analyzed_at})>"

