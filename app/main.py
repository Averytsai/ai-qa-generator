"""
FastAPI 應用程式入口
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.utils.logger import logger

# 導入API路由
from app.api.v1 import generator, reviewer, feedback, categories

# 創建 FastAPI 應用實例
app = FastAPI(
    title=settings.app_name,
    description="AI問答集生成與審查系統",
    version="0.1.0",
    debug=settings.debug,
)

# 配置 CORS
# 解析允許的來源
if settings.cors_origins == "*" or settings.debug:
    # 開發環境或設置為 * 時允許所有來源
    # 注意：當 allow_credentials=True 時，不能使用 ["*"]
    # 所以開發環境也使用具體的域名或允許所有但不使用 credentials
    allowed_origins = ["*"]
    use_credentials = False
else:
    # 生產環境：從環境變數讀取允許的域名
    allowed_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
    use_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=use_credentials,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 添加请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """请求日志中间件"""
    logger.debug(f"收到请求: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.debug(f"响应发送: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"中间件异常: {e}", exc_info=True)
        raise

# 全局异常处理器
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    logger.error(f"未處理的異常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"內部服務器錯誤: {str(exc)}"}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """HTTP 异常处理器"""
    logger.warning(f"HTTP 异常: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """请求验证异常处理器"""
    logger.warning(f"请求验证失败: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body}
    )

# 註冊API路由
app.include_router(generator.router, prefix="/api/v1")
app.include_router(reviewer.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """應用啟動時執行"""
    logger.info(f"應用程式啟動: {settings.app_name}")
    logger.info(f"環境: {settings.app_env}")
    logger.info(f"除錯模式: {settings.debug}")
    
    # 检查数据库连接
    from app.services.database import check_db_connection
    if check_db_connection():
        logger.info("資料庫連接檢查成功")
    else:
        logger.warning("資料庫連接檢查失敗，但應用繼續啟動")


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

