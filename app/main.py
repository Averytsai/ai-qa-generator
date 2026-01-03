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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],  # 開發環境允許所有來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # #region agent log
    import json
    with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
        f.write(json.dumps({"location":"main.py:middleware","message":"Request received","data":{"method":request.method,"url":str(request.url),"path":request.url.path,"headers":dict(request.headers)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"A"}) + '\n')
    # #endregion
    try:
        response = await call_next(request)
        # #region agent log
        with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"main.py:middleware","message":"Response sent","data":{"statusCode":response.status_code,"headers":dict(response.headers)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"A"}) + '\n')
        # #endregion
        return response
    except Exception as e:
        # #region agent log
        import traceback
        with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"main.py:middleware","message":"Middleware exception","data":{"errorType":type(e).__name__,"errorMessage":str(e),"traceback":traceback.format_exc()},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"A"}) + '\n')
        # #endregion
        raise

# 全局异常处理器
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # #region agent log
    import json
    import traceback
    with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
        f.write(json.dumps({"location":"main.py:exception_handler","message":"Global exception caught","data":{"errorType":type(exc).__name__,"errorMessage":str(exc),"traceback":traceback.format_exc(),"path":request.url.path},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"A"}) + '\n')
    # #endregion
    logger.error(f"未處理的異常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"內部服務器錯誤: {str(exc)}"}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # #region agent log
    import json
    with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
        f.write(json.dumps({"location":"main.py:http_exception_handler","message":"HTTP exception","data":{"statusCode":exc.status_code,"detail":exc.detail,"path":request.url.path},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"A"}) + '\n')
    # #endregion
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # #region agent log
    import json
    with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
        f.write(json.dumps({"location":"main.py:validation_exception_handler","message":"Validation error","data":{"errors":exc.errors(),"body":exc.body,"path":request.url.path},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"A"}) + '\n')
    # #endregion
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

