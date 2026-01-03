"""
問答生成 API
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.services.database import get_db
from app.schemas.generator import GenerateRequest, GenerateResponse
from app.schemas.qa_pair import QAPairResponse, QAPairListResponse
from app.core.generator import qa_generator
from app.models.qa_pair import QACategory, QAStatus
from app.utils.logger import logger

router = APIRouter(prefix="/generator", tags=["生成"])


@router.post("/generate")
async def generate_qa(
    request: GenerateRequest,
    db: Session = Depends(get_db)
):
    """
    生成問答對
    
    - **category**: 知識領域
    - **count**: 生成數量（1-100）
    - **topic**: 主題關鍵詞（可選）
    - **style**: 生成風格（專業/通俗/詳細）
    """
    try:
        logger.info(f"收到生成請求: {request.category}, 數量: {request.count}")
        # #region agent log
        import json
        with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"generator.py:34","message":"Request received","data":{"category":str(request.category),"count":request.count,"topic":request.topic,"style":request.style},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"A"}) + '\n')
        # #endregion
        
        # 檢查是否有可用的AI模型
        from app.services.ai_model import model_manager
        available_models = model_manager.list_available_models()
        if not available_models:
            raise HTTPException(
                status_code=503,
                detail="沒有可用的AI模型。請檢查配置：1) 確認.env文件中的OPENAI_API_KEY已配置 2) 確認API Key有效"
            )
        
        # 批量生成問答對
        qa_pairs = await qa_generator.generate_batch(
            category=request.category,
            count=request.count,
            topic=request.topic,
            style=request.style,
            db=db
        )
        
        # 檢查是否成功生成
        if not qa_pairs:
            raise HTTPException(
                status_code=500,
                detail="生成失敗：無法生成問答對。請檢查：1) AI模型是否正常 2) API Key是否有效 3) 查看日志獲取詳細錯誤信息"
            )
        
        # 轉換為響應格式（使用Pydantic v2語法）
        try:
            qa_pair_responses = [
                QAPairResponse.model_validate(qa_pair) for qa_pair in qa_pairs
            ]
            
            # 序列化為字典，使用mode='json'確保枚舉值正確轉換為字符串
            qa_pair_dicts = [
                qa_pair.model_dump(mode='json') for qa_pair in qa_pair_responses
            ]
            
            response = GenerateResponse(
                qa_pairs=qa_pair_dicts,
                total=len(qa_pairs),
                generation_time=0.0  # 可以從生成器返回實際時間
            )
            
            logger.info(f"成功生成響應，包含 {len(qa_pair_dicts)} 個問答對")
            
            # 直接返回字典，避免FastAPI序列化问题
            result = {
                "qa_pairs": qa_pair_dicts,
                "total": len(qa_pairs),
                "generation_time": 0.0
            }
            
            # 验证返回的数据可以JSON序列化
            import json
            try:
                json.dumps(result, default=str)
                logger.info("響應數據JSON序列化驗證通過")
            except Exception as json_err:
                logger.error(f"響應數據JSON序列化失敗: {json_err}", exc_info=True)
                raise HTTPException(status_code=500, detail=f"響應序列化失敗: {str(json_err)}")
            
            # #region agent log
            import json as json_lib
            with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
                f.write(json_lib.dumps({"location":"generator.py:96","message":"Before JSONResponse","data":{"resultKeys":list(result.keys()),"qaPairsCount":len(result.get("qa_pairs",[]))},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
            # #endregion
            # 使用JSONResponse确保正确的Content-Type
            response_obj = JSONResponse(content=result)
            # #region agent log
            with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
                f.write(json_lib.dumps({"location":"generator.py:100","message":"After JSONResponse created","data":{"statusCode":response_obj.status_code,"headers":dict(response_obj.headers)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
            # #endregion
            return response_obj
        except Exception as e:
            logger.error(f"構建響應時發生錯誤: {e}", exc_info=True)
            raise
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"生成問答對失敗: {e}", exc_info=True)
        # #region agent log
        import json as json_lib
        import traceback
        with open('/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/.cursor/debug.log', 'a') as f:
            f.write(json_lib.dumps({"location":"generator.py:105","message":"Exception caught","data":{"errorType":type(e).__name__,"errorMessage":str(e),"traceback":traceback.format_exc()},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
        # #endregion
        raise HTTPException(status_code=500, detail=f"生成失敗: {str(e)}")


@router.get("/history", response_model=QAPairListResponse)
async def get_generation_history(
    category: QACategory = Query(None, description="知識領域"),
    status: QAStatus = Query(None, description="狀態"),
    page: int = Query(1, ge=1, description="頁碼"),
    page_size: int = Query(20, ge=1, le=100, description="每頁數量"),
    db: Session = Depends(get_db)
):
    """
    獲取生成歷史
    
    - **category**: 知識領域（可選）
    - **status**: 狀態（可選）
    - **page**: 頁碼
    - **page_size**: 每頁數量
    """
    try:
        from app.models.qa_pair import QAPair
        
        # 構建查詢
        query = db.query(QAPair)
        
        if category:
            query = query.filter(QAPair.category == category)
        
        if status:
            query = query.filter(QAPair.status == status)
        
        # 計算總數
        total = query.count()
        
        # 分頁
        offset = (page - 1) * page_size
        qa_pairs = query.order_by(QAPair.created_at.desc()).offset(offset).limit(page_size).all()
        
        # 轉換為響應格式（使用Pydantic v2語法）
        items = [QAPairResponse.model_validate(qa_pair) for qa_pair in qa_pairs]
        
        total_pages = (total + page_size - 1) // page_size
        
        return QAPairListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"獲取生成歷史失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取歷史失敗: {str(e)}")

