"""
日誌配置模組
使用 loguru 進行日誌管理
"""
import sys
from pathlib import Path
from loguru import logger

from app.config import settings


def setup_logger():
    """
    設置日誌系統
    """
    # 移除預設的 logger
    logger.remove()
    
    # 創建日誌目錄
    log_file_path = Path(settings.log_file)
    log_file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # 控制台輸出格式
    console_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    
    # 文件輸出格式（更詳細）
    file_format = (
        "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
        "{level: <8} | "
        "{name}:{function}:{line} | "
        "{message}"
    )
    
    # 添加控制台輸出
    logger.add(
        sys.stdout,
        format=console_format,
        level=settings.log_level,
        colorize=True,
        backtrace=True,
        diagnose=True,
    )
    
    # 添加文件輸出
    logger.add(
        settings.log_file,
        format=file_format,
        level=settings.log_level,
        rotation="10 MB",  # 文件大小達到10MB時輪轉
        retention="7 days",  # 保留7天的日誌
        compression="zip",  # 壓縮舊日誌
        backtrace=True,
        diagnose=True,
    )
    
    logger.info(f"日誌系統已初始化，級別: {settings.log_level}")
    logger.info(f"日誌文件: {settings.log_file}")
    
    return logger


# 初始化日誌系統
setup_logger()

