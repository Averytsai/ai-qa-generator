"""
自定義異常類別
"""
from typing import Optional


class BaseAppException(Exception):
    """應用程式基礎異常"""
    def __init__(self, message: str, details: Optional[str] = None):
        self.message = message
        self.details = details
        super().__init__(self.message)


class ValidationError(BaseAppException):
    """驗證錯誤"""
    pass


class DatabaseError(BaseAppException):
    """資料庫錯誤"""
    pass


class GenerationError(BaseAppException):
    """生成錯誤"""
    pass


class ReviewError(BaseAppException):
    """審查錯誤"""
    pass


class AIModelError(BaseAppException):
    """AI模型錯誤"""
    pass


class ConfigurationError(BaseAppException):
    """配置錯誤"""
    pass

