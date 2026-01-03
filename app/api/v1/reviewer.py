"""
問答審查 API
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.services.database import get_db
from app.schemas.review import ReviewRequest, ReviewResponse, BatchReviewRequest, BatchReviewResponse
from app.core.reviewer import qa_reviewer
from app.models.qa_pair import QAPair
from app.utils.logger import logger

router = APIRouter(prefix="/reviewer", tags=["審查"])


@router.post("/review", response_model=ReviewResponse)
async def review_qa(
    request: ReviewRequest,
    db: Session = Depends(get_db)
):
    """
    審查單個問答對
    
    - **qa_pair_id**: 問答對ID
    """
    try:
        # 獲取問答對
        qa_pair = db.query(QAPair).filter(QAPair.id == request.qa_pair_id).first()
        
        if not qa_pair:
            raise HTTPException(status_code=404, detail="問答對不存在")
        
        # 執行審查
        review_result = await qa_reviewer.review(
            qa_pair=qa_pair,
            db=db
        )
        
        # 構建響應
        from app.schemas.review import ReviewScores
        from datetime import datetime
        
        return ReviewResponse(
            qa_pair_id=qa_pair.id,
            reviewer_score=review_result['overall_score'],
            scores=ReviewScores(
                accuracy=review_result['accuracy'],
                completeness=review_result['completeness'],
                relevance=review_result['relevance'],
                language_quality=review_result['language_quality'],
                domain_fit=review_result['domain_fit']
            ),
            suggestions=review_result.get('suggestions', []),
            passed=review_result['passed'],
            reviewed_at=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"審查問答對失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"審查失敗: {str(e)}")


@router.post("/batch-review", response_model=BatchReviewResponse)
async def batch_review_qa(
    request: BatchReviewRequest,
    db: Session = Depends(get_db)
):
    """
    批量審查問答對
    
    - **qa_pair_ids**: 問答對ID列表（最多50個）
    """
    try:
        if len(request.qa_pair_ids) > 50:
            raise HTTPException(status_code=400, detail="批量審查最多支持50個問答對")
        
        # 執行批量審查
        review_results = await qa_reviewer.review_batch(
            qa_pair_ids=request.qa_pair_ids,
            db=db
        )
        
        # 構建響應
        from app.schemas.review import ReviewScores
        from datetime import datetime
        
        results = []
        for result in review_results:
            if 'error' not in result:
                results.append(ReviewResponse(
                    qa_pair_id=UUID(result['qa_pair_id']),
                    reviewer_score=result['overall_score'],
                    scores=ReviewScores(
                        accuracy=result['accuracy'],
                        completeness=result['completeness'],
                        relevance=result['relevance'],
                        language_quality=result['language_quality'],
                        domain_fit=result['domain_fit']
                    ),
                    suggestions=result.get('suggestions', []),
                    passed=result['passed'],
                    reviewed_at=datetime.utcnow().isoformat()
                ))
        
        # 計算摘要
        passed_count = sum(1 for r in results if r.passed)
        failed_count = len(results) - passed_count
        
        summary = {
            "total": len(results),
            "passed": passed_count,
            "failed": failed_count
        }
        
        return BatchReviewResponse(
            results=results,
            summary=summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量審查失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"批量審查失敗: {str(e)}")

