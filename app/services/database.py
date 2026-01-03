"""
資料庫連接和會話管理
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings
from app.utils.logger import logger

# 創建資料庫引擎
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # 連接前檢查連接是否有效
    echo=settings.debug,  # 開發環境下顯示SQL語句
)

# 創建會話工廠
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 創建基礎模型類
Base = declarative_base()


def get_db():
    """
    獲取資料庫會話
    用於FastAPI依賴注入
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    初始化資料庫
    創建所有表結構
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("資料庫表結構創建成功")
    except Exception as e:
        logger.error(f"資料庫初始化失敗: {e}")
        raise


def check_db_connection():
    """
    檢查資料庫連接
    """
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("資料庫連接成功")
        return True
    except Exception as e:
        logger.error(f"資料庫連接失敗: {e}")
        return False

