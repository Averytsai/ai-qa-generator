"""
提示詞模板資料模型
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.models.qa_pair import QACategory
from app.services.database import Base


class PromptTemplate(Base):
    """提示詞模板模型"""
    __tablename__ = "prompt_templates"

    # 主鍵
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)

    # 模板基本信息
    category = Column(Enum(QACategory), nullable=False, index=True, comment="知識領域")
    name = Column(String(200), nullable=False, comment="模板名稱")
    description = Column(Text, nullable=True, comment="模板描述")

    # 模板內容
    template_content = Column(Text, nullable=False, comment="模板內容")

    # 版本管理
    version = Column(String(50), nullable=False, default="1.0", comment="版本號")
    is_active = Column(Boolean, default=True, nullable=False, index=True, comment="是否啟用")

    # 模板參數（JSON格式）
    parameters = Column(JSON, nullable=True, comment="模板參數配置")

    # 優化歷史（JSON格式）
    optimization_history = Column(JSON, nullable=True, comment="優化歷史記錄")

    # 時間戳
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, comment="創建時間")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, comment="更新時間")

    def __repr__(self):
        return f"<PromptTemplate(id={self.id}, category={self.category}, name={self.name}, version={self.version})>"

