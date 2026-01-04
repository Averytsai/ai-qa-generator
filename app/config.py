"""
應用程式配置管理
使用 Pydantic Settings 管理環境變數
"""
from typing import Literal
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """應用程式配置"""
    
    # 應用基本配置
    app_name: str = Field(default="AI問答集生成系統", description="應用名稱")
    app_env: str = Field(default="development", description="環境：development/test/production")
    debug: bool = Field(default=True, description="除錯模式")
    secret_key: str = Field(..., description="密鑰（用於加密）")
    
    # 資料庫配置
    database_url: str = Field(..., description="資料庫連線URL")
    
    # AI模型配置
    openai_api_key: str = Field(default="", description="OpenAI API Key")
    anthropic_api_key: str = Field(default="", description="Anthropic API Key")
    azure_openai_endpoint: str = Field(default="", description="Azure OpenAI Endpoint")
    azure_openai_api_key: str = Field(default="", description="Azure OpenAI API Key")
    
    # 日誌配置
    log_level: str = Field(default="INFO", description="日誌級別")
    log_file: str = Field(default="logs/app.log", description="日誌文件路徑")
    
    # 模型配置
    default_model: str = Field(default="gpt-3.5-turbo", description="預設AI模型")
    
    # CORS 配置
    cors_origins: str = Field(
        default="*", 
        description="允許的CORS來源，多個用逗號分隔，*表示允許所有"
    )
    
    @validator('app_env')
    def validate_app_env(cls, v):
        """驗證環境變數"""
        valid_envs = ['development', 'test', 'production']
        if v not in valid_envs:
            raise ValueError(f'APP_ENV 必須是: {valid_envs}')
        return v
    
    @validator('database_url')
    def validate_database_url(cls, v):
        """驗證資料庫URL格式"""
        if not v.startswith(('postgresql://', 'postgresql+psycopg2://')):
            raise ValueError('DATABASE_URL 必須以 postgresql:// 或 postgresql+psycopg2:// 開頭')
        return v
    
    @validator('log_level')
    def validate_log_level(cls, v):
        """驗證日誌級別"""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'LOG_LEVEL 必須是: {valid_levels}')
        return v.upper()
    
    @property
    def is_development(self) -> bool:
        """是否為開發環境"""
        return self.app_env == "development"
    
    @property
    def is_production(self) -> bool:
        """是否為生產環境"""
        return self.app_env == "production"
    
    @property
    def is_test(self) -> bool:
        """是否為測試環境"""
        return self.app_env == "test"
    
    class Config:
        """Pydantic配置"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# 創建全局配置實例
settings = Settings()

