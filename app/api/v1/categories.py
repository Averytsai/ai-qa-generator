"""
分類管理 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.services.database import get_db
from app.models.qa_pair import QAPair, QACategory, QAStatus
from app.utils.logger import logger

router = APIRouter(prefix="/categories", tags=["分類"])


def _get_category_description(category: QACategory) -> str:
    """獲取分類描述"""
    descriptions = {
        QACategory.GENERAL: "基礎概念、常識性內容",
        QACategory.TECHNICAL: "技術規範、操作流程",
        QACategory.TROUBLESHOOTING: "常見問題、解決方案",
        QACategory.SECURITY: "安全規範、合規要求",
        QACategory.CASE_STUDY: "實際應用、案例分享"
    }
    return descriptions.get(category, "")


@router.get("")
async def get_categories(db: Session = Depends(get_db)):
    """
    獲取所有分類及其統計信息
    """
    try:
        categories_data = []
        
        for category in QACategory:
            # 統計該分類的問答對數量
            total_count = db.query(func.count(QAPair.id)).filter(
                QAPair.category == category
            ).scalar()
            
            categories_data.append({
                "id": category.value,
                "name": category.value,
                "description": _get_category_description(category),
                "qa_count": total_count or 0
            })
        
        return {
            "success": True,
            "data": {
                "categories": categories_data
            }
        }
        
    except Exception as e:
        logger.error(f"獲取分類失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取分類失敗: {str(e)}")


@router.get("/{category_id}/stats")
async def get_category_stats(
    category_id: str,
    db: Session = Depends(get_db)
):
    """
    獲取分類統計信息
    
    - **category_id**: 分類ID（分類名稱）
    """
    try:
        # 驗證分類
        try:
            category = QACategory(category_id)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"無效的分類: {category_id}")
        
        # 統計數據
        total_qa = db.query(func.count(QAPair.id)).filter(
            QAPair.category == category
        ).scalar()
        
        pending_review = db.query(func.count(QAPair.id)).filter(
            QAPair.category == category,
            QAPair.status.in_([QAStatus.PENDING_REVIEW, QAStatus.REVIEWED])
        ).scalar()
        
        approved = db.query(func.count(QAPair.id)).filter(
            QAPair.category == category,
            QAPair.status == QAStatus.APPROVED
        ).scalar()
        
        rejected = db.query(func.count(QAPair.id)).filter(
            QAPair.category == category,
            QAPair.status == QAStatus.REJECTED
        ).scalar()
        
        # 計算平均評分
        avg_score = db.query(func.avg(QAPair.reviewer_score)).filter(
            QAPair.category == category,
            QAPair.reviewer_score.isnot(None)
        ).scalar()
        
        return {
            "success": True,
            "data": {
                "category": category.value,
                "total_qa": total_qa or 0,
                "pending_review": pending_review or 0,
                "approved": approved or 0,
                "rejected": rejected or 0,
                "average_score": round(float(avg_score or 0), 2)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"獲取分類統計失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取統計失敗: {str(e)}")

