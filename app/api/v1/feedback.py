"""
反饋管理 API
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.services.database import get_db
from app.schemas.feedback import FeedbackSubmitRequest, FeedbackSubmitResponse
from app.schemas.qa_pair import QAPairResponse, QAPairListResponse
from app.models.qa_pair import QAPair, QACategory, QAStatus
from app.models.review import Review, ReviewAction
from app.utils.logger import logger

router = APIRouter(prefix="/feedback", tags=["反饋"])


@router.post("/submit", response_model=FeedbackSubmitResponse)
async def submit_feedback(
    request: FeedbackSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    提交審核反饋
    
    - **qa_pair_id**: 問答對ID
    - **action**: 操作類型（approve/modify/reject）
    - **modified_question**: 修改後的問題（如果action=modify）
    - **modified_answer**: 修改後的答案（如果action=modify）
    - **feedback_categories**: 反饋分類
    - **review_reason**: 審查原因
    """
    try:
        # 獲取問答對
        qa_pair = db.query(QAPair).filter(QAPair.id == request.qa_pair_id).first()
        
        if not qa_pair:
            raise HTTPException(status_code=404, detail="問答對不存在")
        
        # 根據操作類型更新問答對
        if request.action == ReviewAction.APPROVE:
            qa_pair.status = QAStatus.APPROVED
            if request.modified_question:
                qa_pair.question = request.modified_question
            if request.modified_answer:
                qa_pair.answer = request.modified_answer
                
        elif request.action == ReviewAction.MODIFY:
            if not request.modified_question or not request.modified_answer:
                raise HTTPException(status_code=400, detail="修改操作必須提供修改後的問題和答案")
            qa_pair.question = request.modified_question
            qa_pair.answer = request.modified_answer
            # 修改後的問答對視為已通過人工審核，設置為APPROVED狀態
            # 這樣修改後的問答對仍然可以在知識庫中查看
            qa_pair.status = QAStatus.APPROVED
            
        elif request.action == ReviewAction.REJECT:
            qa_pair.status = QAStatus.REJECTED
        
        # 創建審查記錄
        review = Review(
            qa_pair_id=qa_pair.id,
            action=request.action,
            modified_question=request.modified_question if request.action == ReviewAction.MODIFY else None,
            modified_answer=request.modified_answer if request.action == ReviewAction.MODIFY else None,
            feedback_categories=request.feedback_categories,
            review_reason=request.review_reason
        )
        
        db.add(review)
        db.commit()
        db.refresh(review)
        
        logger.info(f"反饋已提交，問答對ID: {qa_pair.id}, 操作: {request.action}")
        
        return FeedbackSubmitResponse(
            feedback_id=review.id,
            qa_pair_id=qa_pair.id,
            status=qa_pair.status.value,
            submitted_at=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"提交反饋失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"提交反饋失敗: {str(e)}")


@router.get("/pending", response_model=QAPairListResponse)
async def get_pending_reviews(
    category: QACategory = Query(None, description="知識領域"),
    page: int = Query(1, ge=1, description="頁碼"),
    page_size: int = Query(20, ge=1, le=100, description="每頁數量"),
    db: Session = Depends(get_db)
):
    """
    獲取待審核列表
    
    - **category**: 知識領域（可選）
    - **page**: 頁碼
    - **page_size**: 每頁數量
    """
    try:
        # 構建查詢（待審核的問答對）
        query = db.query(QAPair).filter(
            QAPair.status.in_([QAStatus.PENDING_REVIEW, QAStatus.REVIEWED])
        )
        
        if category:
            query = query.filter(QAPair.category == category)
        
        # 計算總數
        total = query.count()
        
        # 分頁
        offset = (page - 1) * page_size
        qa_pairs = query.order_by(QAPair.created_at.desc()).offset(offset).limit(page_size).all()
        
        # 轉換為響應格式
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
        logger.error(f"獲取待審核列表失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取列表失敗: {str(e)}")

