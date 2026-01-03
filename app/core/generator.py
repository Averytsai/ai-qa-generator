"""
問答生成模組
"""
import re
import time
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.qa_pair import QAPair, QACategory, QAStatus
from app.services.ai_model import model_manager, ModelProvider
from app.services.prompt_manager import prompt_manager
from app.utils.logger import logger
from app.utils.exceptions import GenerationError


class QAGenerator:
    """問答生成器"""
    
    def __init__(self):
        """初始化生成器"""
        self.model_manager = model_manager
        self.prompt_manager = prompt_manager
    
    def _parse_qa_pair(self, text: str) -> tuple[str, str]:
        """
        從AI生成的文本中解析問答對
        
        Args:
            text: AI生成的文本
            
        Returns:
            (問題, 答案) 元組
        """
        # 嘗試多種格式匹配
        patterns = [
            # 格式1: 問題：[問題內容]\n答案：[答案內容]
            r'問題[：:]\s*(.+?)\n答案[：:]\s*(.+?)(?:\n|$)',
            # 格式2: Q: [問題內容]\nA: [答案內容]
            r'Q[：:]\s*(.+?)\nA[：:]\s*(.+?)(?:\n|$)',
            # 格式3: 問：[問題內容]\n答：[答案內容]
            r'問[：:]\s*(.+?)\n答[：:]\s*(.+?)(?:\n|$)',
            # 格式4: 問題：[問題內容]\n\n答案：[答案內容]
            r'問題[：:]\s*(.+?)\n\n答案[：:]\s*(.+?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                question = match.group(1).strip()
                answer = match.group(2).strip()
                return question, answer
        
        # 如果沒有匹配到格式，嘗試按段落分割
        lines = text.strip().split('\n')
        if len(lines) >= 2:
            # 假設第一段是問題，其餘是答案
            question = lines[0].strip()
            # 移除可能的"問題："前綴
            question = re.sub(r'^問題[：:]\s*', '', question)
            answer = '\n'.join(lines[1:]).strip()
            # 移除可能的"答案："前綴
            answer = re.sub(r'^答案[：:]\s*', '', answer)
            return question, answer
        
        # 如果都失敗，拋出錯誤
        raise GenerationError(f"無法解析問答對格式。生成內容：\n{text}")
    
    def _get_existing_questions(
        self,
        category: QACategory,
        topic: Optional[str] = None,
        db: Optional[Session] = None,
        limit: int = 10
    ) -> List[str]:
        """
        獲取已有的問題列表（用於避免重複）
        
        Args:
            category: 知識領域
            topic: 主題關鍵詞（可選，用於過濾）
            db: 數據庫會話
            limit: 返回的最大數量
            
        Returns:
            已有問題列表
        """
        if not db:
            return []
        
        try:
            query = db.query(QAPair.question).filter(
                QAPair.category == category
            )
            
            # 如果提供了主題，可以進一步過濾（這裡先簡單實現）
            # 後續可以根據主題關鍵詞進行相似度匹配
            
            existing_questions = query.order_by(
                QAPair.created_at.desc()
            ).limit(limit).all()
            
            return [q[0] for q in existing_questions if q[0]]
        except Exception as e:
            logger.warning(f"獲取已有問題失敗: {e}")
            return []
    
    def _check_similarity(self, question1: str, question2: str) -> float:
        """
        檢查兩個問題的相似度（簡單版本）
        
        Args:
            question1: 問題1
            question2: 問題2
            
        Returns:
            相似度分數（0-1），1表示完全相同
        """
        # 簡單的相似度檢查：計算共同字符比例
        q1_set = set(question1.lower().replace(' ', '').replace('？', '').replace('?', ''))
        q2_set = set(question2.lower().replace(' ', '').replace('？', '').replace('?', ''))
        
        if not q1_set or not q2_set:
            return 0.0
        
        intersection = len(q1_set & q2_set)
        union = len(q1_set | q2_set)
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    def _is_duplicate(self, new_question: str, existing_questions: List[str], threshold: float = 0.7) -> bool:
        """
        檢查新問題是否與已有問題重複
        
        Args:
            new_question: 新問題
            existing_questions: 已有問題列表
            threshold: 相似度閾值，超過此值視為重複
            
        Returns:
            是否重複
        """
        for existing_q in existing_questions:
            similarity = self._check_similarity(new_question, existing_q)
            if similarity >= threshold:
                logger.warning(f"檢測到重複問題，相似度: {similarity:.2f}\n新問題: {new_question}\n已有問題: {existing_q}")
                return True
        return False
    
    async def generate_single(
        self,
        category: QACategory,
        topic: Optional[str] = None,
        style: str = "專業",
        db: Optional[Session] = None,
        template_id: Optional[UUID] = None,
        provider: Optional[ModelProvider] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        max_retries: int = 3
    ) -> QAPair:
        """
        生成單個問答對
        
        Args:
            category: 知識領域
            topic: 主題關鍵詞
            style: 生成風格
            db: 數據庫會話
            template_id: 提示詞模板ID
            provider: AI模型提供商
            max_tokens: 最大token數
            temperature: 溫度參數
            max_retries: 最大重試次數（當生成重複問題時）
            
        Returns:
            生成的問答對對象
        """
        # 獲取已有問題列表
        existing_questions = self._get_existing_questions(
            category=category,
            topic=topic,
            db=db,
            limit=20  # 獲取最近20個問題作為參考
        )
        
        for attempt in range(max_retries):
            try:
                # 獲取格式化後的提示詞
                base_prompt = self.prompt_manager.get_formatted_prompt(
                    category=category,
                    topic=topic,
                    style=style,
                    db=db,
                    template_id=template_id
                )
                
                # 如果有已有問題，添加到prompt中
                if existing_questions:
                    existing_examples = "\n".join([
                        f"- {q}" for q in existing_questions[:10]  # 只顯示前10個
                    ])
                    prompt = f"""{base_prompt}

**重要提醒**：以下是已生成的類似問題示例，請確保你生成的問題與這些問題不同（可以主題相近，但表達方式、角度或重點必須有明顯區別）：

已有問題示例：
{existing_examples}

請生成一個全新的、獨特的問題，避免與上述問題重複。"""
                else:
                    prompt = base_prompt
            
                logger.info(f"開始生成問答對（分類: {category}, 主題: {topic}，嘗試次數: {attempt + 1}/{max_retries}）")
                
                # 調用AI模型生成
                start_time = time.time()
                generated_text = await self.model_manager.generate_with_retry(
                    prompt=prompt,
                    provider=provider,
                    max_tokens=max_tokens,
                    temperature=temperature + (attempt * 0.1)  # 每次重試增加溫度，增加多樣性
                )
                generation_time = time.time() - start_time
                
                logger.info(f"AI生成完成，耗時: {generation_time:.2f}秒")
                
                # 解析問答對
                question, answer = self._parse_qa_pair(generated_text)
                
                # 檢查是否與已有問題重複
                if existing_questions and self._is_duplicate(question, existing_questions):
                    if attempt < max_retries - 1:
                        logger.warning(f"檢測到重複問題，將重試生成（嘗試 {attempt + 1}/{max_retries}）")
                        continue
                    else:
                        logger.warning(f"已達到最大重試次數，但仍可能與已有問題相似")
                
                # 創建問答對對象
                qa_pair = QAPair(
                    question=question,
                    answer=answer,
                    category=category,
                    status=QAStatus.PENDING_REVIEW,
                    prompt_template_id=template_id
                )
                
                # 如果提供了數據庫會話，保存到數據庫
                if db:
                    db.add(qa_pair)
                    db.commit()
                    db.refresh(qa_pair)
                    logger.info(f"問答對已保存到數據庫，ID: {qa_pair.id}")
                
                # 將新問題添加到已有問題列表（用於後續生成時檢查）
                existing_questions.insert(0, question)
                
                return qa_pair
                
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"生成問答對失敗（嘗試 {attempt + 1}/{max_retries}）: {e}")
                    continue
                else:
                    logger.error(f"生成問答對失敗（已達最大重試次數）: {e}", exc_info=True)
                    raise GenerationError(f"生成問答對失敗: {str(e)}")
        
        # 如果所有重試都失敗
        raise GenerationError(f"生成問答對失敗：已達到最大重試次數 {max_retries}")
    
    async def generate_batch(
        self,
        category: QACategory,
        count: int,
        topic: Optional[str] = None,
        style: str = "專業",
        db: Optional[Session] = None,
        template_id: Optional[UUID] = None,
        provider: Optional[ModelProvider] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> List[QAPair]:
        """
        批量生成問答對
        
        Args:
            category: 知識領域
            count: 生成數量
            topic: 主題關鍵詞
            style: 生成風格
            db: 數據庫會話
            template_id: 提示詞模板ID
            provider: AI模型提供商
            max_tokens: 最大token數
            temperature: 溫度參數
            
        Returns:
            生成的問答對列表
        """
        qa_pairs = []
        errors = []
        
        logger.info(f"開始批量生成 {count} 個問答對（分類: {category}）")
        
        # 獲取所有已有問題（用於整個批量生成過程的去重檢查）
        all_existing_questions = self._get_existing_questions(
            category=category,
            topic=topic,
            db=db,
            limit=50  # 獲取更多已有問題用於檢查
        )
        
        for i in range(count):
            try:
                # 在批量生成時，將已生成的問題也加入檢查列表
                current_existing = all_existing_questions + [qa.question for qa in qa_pairs]
                
                qa_pair = await self.generate_single(
                    category=category,
                    topic=topic,
                    style=style,
                    db=db,
                    template_id=template_id,
                    provider=provider,
                    max_tokens=max_tokens,
                    temperature=temperature + (i * 0.05)  # 逐步增加溫度，增加多樣性
                )
                
                # 檢查是否與本次批量生成的其他問題重複
                if qa_pairs and self._is_duplicate(qa_pair.question, [qa.question for qa in qa_pairs]):
                    logger.warning(f"第 {i+1} 個問答對與本次批量生成的其他問題重複，但已保存")
                
                qa_pairs.append(qa_pair)
                logger.info(f"已生成 {i+1}/{count} 個問答對")
                
                # 避免API速率限制，添加小延遲
                if i < count - 1:
                    await asyncio.sleep(0.5)
                    
            except Exception as e:
                logger.error(f"生成第 {i+1} 個問答對失敗: {e}")
                errors.append(f"第 {i+1} 個: {str(e)}")
        
        if errors:
            logger.warning(f"批量生成完成，成功: {len(qa_pairs)}, 失敗: {len(errors)}")
        else:
            logger.info(f"批量生成完成，成功生成 {len(qa_pairs)} 個問答對")
        
        return qa_pairs


# 創建全局生成器實例
import asyncio
qa_generator = QAGenerator()

