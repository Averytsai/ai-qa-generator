"""
問答審查模組
"""
import json
import time
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.qa_pair import QAPair, QAStatus
from app.models.review import Review
from app.services.ai_model import model_manager, ModelProvider
from app.utils.logger import logger
from app.utils.exceptions import ReviewError


class QAReviewer:
    """問答審查器"""
    
    def __init__(self):
        """初始化審查器"""
        self.model_manager = model_manager
    
    def _create_review_prompt(self, question: str, answer: str, category: str) -> str:
        """
        創建審查提示詞
        
        Args:
            question: 問題文本
            answer: 答案文本
            category: 知識領域
            
        Returns:
            審查提示詞
        """
        prompt = f"""你是一個專業的問答質量審查員。請對以下問答對進行**極其嚴格**的評估。

知識領域：{category}

問題：
{question}

答案：
{answer}

**⚠️ 極其重要的審查標準**：
1. **如果答案只有標題、開頭或片段（如只有"背景介紹："、"問題："、"答案："等標題但沒有實際內容），所有維度評分都必須很低（0-20分）**
2. **如果答案長度少於50個字符，或明顯不完整，完整性評分必須很低（0-30分）**
3. **如果答案沒有實質內容回答問題，相關性評分必須很低（0-30分）**
4. **領域適配性必須針對雲端服務和AI相關內容，如果與雲端服務/AI無關，評分必須很低（0-30分）**

請從以下五個維度進行**極其嚴格**的評分（每個維度0-100分），並提供改進建議：

1. **準確性（Accuracy）**：答案是否正確、無誤導性
   - **如果答案只有標題沒有內容，評分必須為0-20分**
   - **如果答案長度少於50字符，評分必須為0-30分**
   - 如果答案有錯誤或誤導性信息，評分應為30-60分
   - 如果答案正確且無誤導，評分應為70-100分

2. **完整性（Completeness）**：答案是否完整回答了問題
   - **如果答案只有標題或開頭（如"背景介紹："、"問題："等），沒有實質內容，評分必須為0-20分**
   - **如果答案長度少於100字符，評分必須為0-40分**
   - 如果答案部分回答了問題，但不完整，評分應為40-60分
   - 如果答案完整回答了問題的所有方面，評分應為70-100分

3. **相關性（Relevance）**：答案是否與問題高度相關
   - **如果答案只有標題沒有內容，評分必須為0-20分**
   - **如果答案沒有實質內容回答問題，評分必須為0-30分**
   - 如果答案部分相關但偏離主題，評分應為30-60分
   - 如果答案直接相關且切中要點，評分應為70-100分

4. **語言質量（Language Quality）**：表達是否清晰、專業
   - **如果答案只有標題或片段，沒有完整內容，評分必須為0-20分**
   - **如果答案表達模糊、不完整或只有片段，評分必須為0-40分**
   - 如果答案表達基本清晰但不夠專業，評分應為40-70分
   - 如果答案表達清晰、專業、易懂，評分應為70-100分

5. **領域適配性（Domain Fit）**：是否符合{category}領域的特點，且**必須針對雲端服務和AI**相關內容
   - **如果答案只有標題沒有內容，評分必須為0-20分**
   - **如果答案與雲端服務/AI無關，評分必須為0-30分**
   - **如果答案沒有明確提到雲端服務或AI相關內容，評分必須為0-50分**
   - 如果答案部分符合領域特點，且提到雲端服務/AI但相關性不強，評分應為50-70分
   - 如果答案完全符合領域特點，且明確針對雲端服務/AI，評分應為70-100分

**嚴格評分規則**：
- **如果答案只有標題沒有內容（如"背景介紹："、"問題："等），所有維度評分都必須在0-20分之間**
- **如果答案長度少於100字符，完整性評分必須在0-40分之間**
- **如果答案沒有明確提到雲端服務或AI，領域適配性評分必須在0-50分之間**
- 總體評分（overall_score）是5個維度的平均值
- **只有當overall_score >= 60，且完整性 >= 50，且相關性 >= 50時，passed才為true**

請以JSON格式返回結果：
{{
    "accuracy": 85,
    "completeness": 80,
    "relevance": 75,
    "language_quality": 82,
    "domain_fit": 70,
    "overall_score": 78,
    "suggestions": [
        "建議1",
        "建議2"
    ],
    "passed": true
}}

請確保返回的是有效的JSON格式。"""
        
        return prompt
    
    def _parse_review_result(self, text: str) -> Dict:
        """
        解析AI返回的審查結果
        
        Args:
            text: AI返回的文本
            
        Returns:
            解析後的審查結果字典
        """
        # 嘗試提取JSON
        json_match = None
        
        # 嘗試多種方式提取JSON
        patterns = [
            r'\{[^{}]*"accuracy"[^{}]*\}',  # 簡單JSON
            r'\{.*?"accuracy".*?\}',  # 包含換行的JSON
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                json_match = match.group(0)
                break
        
        # 如果沒找到，嘗試整個文本
        if not json_match:
            json_match = text.strip()
        
        try:
            # 清理可能的markdown代碼塊標記
            json_match = re.sub(r'```json\s*', '', json_match)
            json_match = re.sub(r'```\s*', '', json_match)
            json_match = json_match.strip()
            
            result = json.loads(json_match)
            
            # 驗證必要字段
            required_fields = ['accuracy', 'completeness', 'relevance', 'language_quality', 'domain_fit']
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"缺少必要字段: {field}")
            
            # 計算總分（如果沒有提供）
            if 'overall_score' not in result:
                scores = [
                    result['accuracy'],
                    result['completeness'],
                    result['relevance'],
                    result['language_quality'],
                    result['domain_fit']
                ]
                result['overall_score'] = int(sum(scores) / len(scores))
            
            # 確保passed字段存在
            # 更嚴格的通過標準：
            # 1. 總分 >= 60
            # 2. 完整性 >= 50（確保答案有實質內容）
            # 3. 相關性 >= 50（確保答案回答了問題）
            # 4. 領域適配性 >= 40（確保與雲端服務/AI相關）
            if 'passed' not in result:
                overall_pass = result['overall_score'] >= 60
                completeness_pass = result.get('completeness', 0) >= 50
                relevance_pass = result.get('relevance', 0) >= 50
                domain_fit_pass = result.get('domain_fit', 0) >= 40
                # 所有條件都必須滿足才能通過
                result['passed'] = overall_pass and completeness_pass and relevance_pass and domain_fit_pass
            
            # 確保suggestions存在
            if 'suggestions' not in result:
                result['suggestions'] = []
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失敗: {e}\n文本內容: {text}")
            raise ReviewError(f"無法解析審查結果JSON: {str(e)}")
        except Exception as e:
            logger.error(f"解析審查結果失敗: {e}")
            raise ReviewError(f"解析審查結果失敗: {str(e)}")
    
    async def review(
        self,
        qa_pair: QAPair,
        provider: Optional[ModelProvider] = None,
        db: Optional[Session] = None
    ) -> Dict:
        """
        審查單個問答對
        
        Args:
            qa_pair: 問答對對象
            provider: AI模型提供商
            db: 數據庫會話
            
        Returns:
            審查結果字典
        """
        try:
            logger.info(f"開始審查問答對，ID: {qa_pair.id}")
            
            # 創建審查提示詞
            prompt = self._create_review_prompt(
                question=qa_pair.question,
                answer=qa_pair.answer,
                category=qa_pair.category.value
            )
            
            # 調用AI模型進行審查
            start_time = time.time()
            review_text = await self.model_manager.generate_with_retry(
                prompt=prompt,
                provider=provider,
                max_tokens=500,
                temperature=0.3  # 審查時使用較低溫度，更穩定
            )
            review_time = time.time() - start_time
            
            logger.info(f"AI審查完成，耗時: {review_time:.2f}秒")
            
            # 解析審查結果
            review_result = self._parse_review_result(review_text)
            
            # **代码层面的严格检查：如果答案不完整，强制降低评分**
            answer_length = len(qa_pair.answer.strip())
            answer_text = qa_pair.answer.strip()
            
            # 检查答案是否只有标题或片段
            incomplete_indicators = [
                '背景介紹：', '背景介绍：', '背景：',
                '問題：', '问题：', 'Q：', 'Q:',
                '答案：', '答案：', 'A：', 'A:',
                '實施方案：', '实施方案：',
                '挑戰分析：', '挑战分析：',
            ]
            
            is_incomplete = False
            if answer_length < 50:  # 答案少于50字符
                is_incomplete = True
            elif answer_length < 100:  # 答案少于100字符，检查是否只有标题
                for indicator in incomplete_indicators:
                    if answer_text.startswith(indicator) and len(answer_text) <= len(indicator) + 10:
                        is_incomplete = True
                        break
            
            # 如果答案不完整，强制调整评分
            if is_incomplete:
                logger.warning(f"检测到不完整答案（长度: {answer_length}字符），强制降低评分")
                # 强制设置低分
                review_result['completeness'] = min(review_result.get('completeness', 50), 20)
                review_result['relevance'] = min(review_result.get('relevance', 50), 20)
                review_result['language_quality'] = min(review_result.get('language_quality', 50), 30)
                review_result['accuracy'] = min(review_result.get('accuracy', 50), 30)
                review_result['domain_fit'] = min(review_result.get('domain_fit', 50), 30)
                # 重新计算总分
                scores = [
                    review_result['accuracy'],
                    review_result['completeness'],
                    review_result['relevance'],
                    review_result['language_quality'],
                    review_result['domain_fit']
                ]
                review_result['overall_score'] = int(sum(scores) / len(scores))
                review_result['passed'] = False
                review_result['suggestions'] = review_result.get('suggestions', []) + [
                    "答案不完整，只有标题或开头，需要补充完整内容"
                ]
            
            # 更新問答對的審查評分
            from datetime import datetime
            qa_pair.reviewer_score = review_result['overall_score']
            qa_pair.status = QAStatus.REVIEWED if review_result['passed'] else QAStatus.PENDING_REVIEW
            qa_pair.reviewed_at = datetime.utcnow()
            
            # 如果提供了數據庫會話，保存更新
            if db:
                db.commit()
                logger.info(f"審查結果已保存，評分: {review_result['overall_score']}")
            
            return review_result
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"審查問答對失敗: {error_msg}", exc_info=True)
            raise ReviewError(f"審查問答對失敗: {error_msg}")
    
    async def review_batch(
        self,
        qa_pair_ids: List[UUID],
        provider: Optional[ModelProvider] = None,
        db: Optional[Session] = None
    ) -> List[Dict]:
        """
        批量審查問答對
        
        Args:
            qa_pair_ids: 問答對ID列表
            provider: AI模型提供商
            db: 數據庫會話
            
        Returns:
            審查結果列表
        """
        results = []
        errors = []
        
        logger.info(f"開始批量審查 {len(qa_pair_ids)} 個問答對")
        
        # 從數據庫加載問答對
        if db:
            qa_pairs = db.query(QAPair).filter(QAPair.id.in_(qa_pair_ids)).all()
        else:
            raise ReviewError("批量審查需要數據庫會話")
        
        for i, qa_pair in enumerate(qa_pairs):
            try:
                result = await self.review(
                    qa_pair=qa_pair,
                    provider=provider,
                    db=db
                )
                result['qa_pair_id'] = str(qa_pair.id)
                results.append(result)
                logger.info(f"已審查 {i+1}/{len(qa_pairs)} 個問答對")
                
                # 避免API速率限制
                if i < len(qa_pairs) - 1:
                    await asyncio.sleep(0.5)
                    
            except Exception as e:
                logger.error(f"審查第 {i+1} 個問答對失敗: {e}")
                errors.append({
                    'qa_pair_id': str(qa_pair.id),
                    'error': str(e)
                })
        
        logger.info(f"批量審查完成，成功: {len(results)}, 失敗: {len(errors)}")
        
        return results


# 創建全局審查器實例
import re
import asyncio
qa_reviewer = QAReviewer()

