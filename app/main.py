"""
FastAPI 應用程式入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.utils.logger import logger


# 創建 FastAPI 應用實例
app = FastAPI(
    title=settings.app_name,
    description="AI問答集生成與審查系統",
    version="0.1.0",
    debug=settings.debug,
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],  # 開發環境允許所有來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """應用啟動時執行"""
    logger.info(f"應用程式啟動: {settings.app_name}")
    logger.info(f"環境: {settings.app_env}")
    logger.info(f"除錯模式: {settings.debug}")


@app.on_event("shutdown")
async def shutdown_event():
    """應用關閉時執行"""
    logger.info("應用程式關閉")


@app.get("/")
async def root():
    """根路徑"""
    return {
        "message": "AI問答集生成系統 API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康檢查"""
    return {
        "status": "healthy",
        "environment": settings.app_env
    }

