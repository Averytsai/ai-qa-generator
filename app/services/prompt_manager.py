"""
提示詞模板管理服務
"""
from typing import Dict, Optional, Any
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.prompt_template import PromptTemplate, QACategory
from app.services.database import SessionLocal
from app.utils.logger import logger
from app.utils.exceptions import ValidationError


class PromptManager:
    """提示詞模板管理器"""
    
    def __init__(self):
        """初始化模板管理器"""
        self._cache: Dict[str, PromptTemplate] = {}
        self._load_default_templates()
    
    def _load_default_templates(self):
        """加載默認模板（如果數據庫中沒有）"""
        # 這裡定義默認模板，後續可以從數據庫加載
        self._default_templates = {
            QACategory.GENERAL: """你是Glows.ai問答生成助手。你是一個專業的知識普及專家，擅長用通俗易懂的方式解釋複雜概念。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個通用知識問答對，幫助普通用戶理解基礎概念。

**問題要求**：
1. 問題應該貼近日常生活或工作場景，讓用戶容易產生共鳴
2. 問題表達應該自然、口語化，避免過於正式或學術化
3. 問題應該聚焦於"是什麼"、"為什麼"、"有什麼用"等基礎層面

**答案要求**：
1. **通俗易懂**：使用簡單的語言，避免過多專業術語。如果必須使用專業術語，請立即解釋
2. **結構清晰**：按照以下結構組織答案
   - 簡要定義（1-2句話）
   - 具體例子或類比（幫助理解）
   - 實際應用場景（讓用戶知道如何運用）
   - 簡短總結
3. **長度適中**：答案長度控制在100-300字，確保信息完整但不冗長
4. **風格匹配**：根據{style}風格調整表達方式
   - 專業：使用正式但易懂的語言
   - 通俗：使用生活化的例子和比喻
   - 詳細：可以適當展開說明

**重要提醒**：
- 問題可以與類似主題相近，但必須是獨特的、不重複的問題
- 確保問題的表達方式、角度或重點與已有問題有所區別
- 答案應該讓沒有專業背景的用戶也能理解

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]""",
            
            QACategory.TECHNICAL: """你是Glows.ai問答生成助手。你是一個資深的技術文檔專家，擅長編寫清晰、準確、可執行的技術指南。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個技術流程問答對，幫助技術人員完成具體的操作任務。

**問題要求**：
1. 問題應該明確指向一個具體的技術操作或流程
2. 問題應該包含必要的上下文信息（如環境、版本、場景）
3. 問題表達應該精確，避免模糊不清

**答案要求**：
1. **完整可執行**：答案必須包含所有必要的步驟，確保技術人員可以直接按照步驟操作
2. **結構化呈現**：按照以下結構組織答案
   - **前置條件**：列出執行此操作前需要滿足的條件（如軟件版本、權限要求、環境配置等）
   - **詳細步驟**：使用編號列表（1, 2, 3...）清晰展示每個步驟
     - 每個步驟應該包含：要做什麼、怎麼做、預期結果
   - **驗證方法**：說明如何驗證操作是否成功
   - **常見問題**：列出可能遇到的問題及解決方法（可選）
3. **技術準確性**：
   - 命令、代碼、配置項必須準確無誤
   - 如果涉及版本差異，請明確說明
   - 提供必要的代碼示例或配置示例
4. **風格匹配**：根據{style}風格調整詳細程度
   - 專業：簡潔精煉，重點突出
   - 通俗：增加解釋說明，幫助理解
   - 詳細：包含更多細節、注意事項和最佳實踐

**重要提醒**：
- 問題可以與類似技術主題相近，但必須是獨特的、不重複的問題
- 請從不同角度、不同場景或不同層次提出問題（如：入門級 vs 進階級、不同工具、不同環境）
- 答案必須確保技術準確性，避免誤導

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]""",
            
            QACategory.TROUBLESHOOTING: """你是Glows.ai問答生成助手。你是一個經驗豐富的故障排除專家，擅長系統化地診斷和解決問題。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個故障排除問答對，幫助用戶診斷和解決實際問題。

**問題要求**：
1. 問題應該描述一個具體的故障場景或錯誤現象
2. 問題應該包含足夠的上下文信息（如錯誤訊息、操作環境、發生時機）
3. 問題表達應該清晰，讓讀者能夠識別是否遇到相同問題

**答案要求**：
1. **系統化診斷**：按照以下結構組織答案
   - **問題症狀**：簡要總結問題表現
   - **可能原因**：列出2-4個最常見的原因（按可能性排序）
   - **診斷步驟**：提供系統化的診斷方法，幫助用戶確定具體原因
     - 從簡單到複雜：先檢查常見問題，再深入排查
     - 每個診斷步驟應該明確：檢查什麼、怎麼檢查、如何判斷
   - **解決方案**：針對每個可能原因提供對應的解決方法
     - 如果有多個解決方案，按優先級排序（最簡單、最有效的方法優先）
     - 每個解決方案應該包含：具體步驟、預期效果、注意事項
   - **預防措施**：說明如何避免此問題再次發生
2. **邏輯清晰**：
   - 使用清晰的標題和編號
   - 診斷步驟應該有邏輯順序
   - 解決方案應該具體可操作
3. **實用性強**：
   - 提供實際可用的命令、配置或操作步驟
   - 如果涉及日誌分析，提供關鍵字或模式
   - 說明如何驗證問題是否解決

**重要提醒**：
- 問題可以與類似故障場景相近，但必須是獨特的、不重複的問題
- 請從不同故障類型、不同原因或不同環境角度提出問題
- 答案應該幫助用戶理解問題的根本原因，而不僅僅是提供解決方法

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]""",
            
            QACategory.SECURITY: """你是Glows.ai問答生成助手。你是一個資深的資安和法規合規專家，擅長解讀和應用相關法規標準。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個資安法規問答對，幫助組織和個人理解合規要求並實施安全措施。

**問題要求**：
1. 問題應該涉及具體的安全規範、法規要求或合規性問題
2. 問題應該明確指向某個法規條款、標準或合規場景
3. 問題表達應該正式、嚴謹

**答案要求**：
1. **法規依據明確**：按照以下結構組織答案
   - **法規要求**：明確指出相關的法規、標準或規範（如：GDPR、ISO 27001、個資法等）
   - **具體規定**：詳細說明法規中的具體要求或條款
   - **合規做法**：提供符合法規要求的具體實施方法
     - 技術措施：如加密、存取控制、日誌記錄等
     - 管理措施：如政策制定、人員培訓、審計流程等
   - **違規後果**：說明不符合法規要求的風險和後果（如：罰款、法律責任、聲譽損失等）
   - **最佳實踐**：提供業界認可的最佳實踐建議
2. **嚴謹準確**：
   - 使用正式、嚴謹的語言
   - 法規引用必須準確（如可能，提供具體條款編號）
   - 避免模糊表述，確保信息準確
3. **實用性強**：
   - 提供可操作的實施建議
   - 說明如何驗證合規性
   - 提供相關工具或資源的參考

**重要提醒**：
- 問題可以與類似資安法規主題相近，但必須是獨特的、不重複的問題
- 請從不同法規條款、不同安全場景或不同合規角度提出問題
- 答案必須確保法規信息的準確性，如有不確定之處應明確說明

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]""",
            
            QACategory.CASE_STUDY: """你是Glows.ai問答生成助手。你是一個資深的案例研究專家，擅長分析實際應用場景並總結經驗教訓。

知識領域：{category}
主題關鍵詞：{topic}
生成風格：{style}

**你的任務**：生成一個應用案例問答對，幫助讀者了解實際應用場景並獲得可參考的經驗。

**問題要求**：
1. 問題應該描述一個具體的應用場景或實施案例
2. 問題應該包含必要的背景信息（如行業、規模、目標）
3. 問題應該聚焦於"如何實施"、"效果如何"、"有什麼經驗"等實用層面

**答案要求**：
1. **案例完整詳實**：按照以下結構組織答案
   - **背景介紹**：說明案例的背景信息
     - 組織/項目基本情況（行業、規模、業務特點）
     - 面臨的挑戰或需求
     - 實施目標
   - **挑戰分析**：詳細分析實施過程中遇到的主要挑戰
   - **實施方案**：說明採用的解決方案或方法
     - 方案設計思路
     - 關鍵技術或方法
     - 實施步驟概述
   - **實施過程**：描述實際實施過程中的關鍵節點和經驗
     - 時間線或階段劃分
     - 關鍵決策點
     - 遇到的問題及解決方法
   - **效果評估**：提供可量化的效果或成果
     - 關鍵指標的改善情況（如：效率提升、成本降低、用戶滿意度等）
     - 預期目標達成情況
     - 其他意外收穫
   - **經驗總結**：總結可複製的經驗和教訓
     - 成功因素
     - 需要注意的問題
     - 適用場景和限制條件
2. **真實具體**：
   - 使用具體的數據和事實（可以是典型數據或範圍）
   - 避免過於抽象的描述
   - 提供可參考的實施細節
3. **參考價值**：
   - 經驗總結應該具有通用性
   - 說明適用場景和限制條件
   - 提供可操作的建議

**重要提醒**：
- 問題可以與類似應用場景相近，但必須是獨特的、不重複的問題
- 請從不同行業、不同規模、不同實施階段或不同挑戰角度提出問題
- 案例應該具有代表性，能夠為類似場景提供參考價值

請生成一個問答對，格式如下：
問題：[問題內容]
答案：[答案內容]"""
        }
    
    def get_template(
        self,
        category: QACategory,
        db: Optional[Session] = None,
        template_id: Optional[UUID] = None
    ) -> str:
        """
        獲取提示詞模板
        
        Args:
            category: 知識領域
            db: 數據庫會話（如果提供則從數據庫加載）
            template_id: 模板ID（如果提供則使用指定模板）
            
        Returns:
            模板內容字符串
        """
        # 如果提供了數據庫會話和模板ID，從數據庫加載
        if db and template_id:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.id == template_id,
                PromptTemplate.is_active == True
            ).first()
            
            if template:
                logger.info(f"從數據庫加載模板: {template.name} (版本: {template.version})")
                return template.template_content
        
        # 如果提供了數據庫會話，嘗試從數據庫加載該分類的活動模板
        if db:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.category == category,
                PromptTemplate.is_active == True
            ).order_by(PromptTemplate.created_at.desc()).first()
            
            if template:
                logger.info(f"從數據庫加載模板: {template.name} (版本: {template.version})")
                return template.template_content
        
        # 使用緩存
        cache_key = str(category)
        if cache_key in self._cache:
            return self._cache[cache_key].template_content
        
        # 使用默認模板
        if category in self._default_templates:
            logger.info(f"使用默認模板: {category}")
            return self._default_templates[category]
        
        # 如果都沒有，返回通用模板
        logger.warning(f"未找到 {category} 的模板，使用通用模板")
        return self._default_templates.get(QACategory.GENERAL, "")
    
    def format_template(
        self,
        template: str,
        category: QACategory,
        topic: Optional[str] = None,
        style: str = "专业",
        **kwargs
    ) -> str:
        """
        格式化模板，替換參數
        
        Args:
            template: 模板內容
            category: 知識領域
            topic: 主題關鍵詞
            style: 生成風格
            **kwargs: 其他參數
            
        Returns:
            格式化後的提示詞
        """
        # 準備參數
        params = {
            "category": category.value,
            "topic": topic or "不限",
            "style": style,
            **kwargs
        }
        
        # 替換參數
        try:
            formatted = template.format(**params)
            return formatted
        except KeyError as e:
            logger.error(f"模板參數缺失: {e}")
            raise ValidationError(f"模板參數缺失: {e}")
    
    def get_formatted_prompt(
        self,
        category: QACategory,
        topic: Optional[str] = None,
        style: str = "专业",
        db: Optional[Session] = None,
        template_id: Optional[UUID] = None,
        **kwargs
    ) -> str:
        """
        獲取格式化後的提示詞（一步到位）
        
        Args:
            category: 知識領域
            topic: 主題關鍵詞
            style: 生成風格
            db: 數據庫會話
            template_id: 模板ID
            **kwargs: 其他參數
            
        Returns:
            格式化後的提示詞
        """
        template = self.get_template(
            category=category,
            db=db,
            template_id=template_id
        )
        
        return self.format_template(
            template=template,
            category=category,
            topic=topic,
            style=style,
            **kwargs
        )
    
    def create_template(
        self,
        db: Session,
        category: QACategory,
        name: str,
        template_content: str,
        description: Optional[str] = None,
        version: str = "1.0",
        parameters: Optional[Dict[str, Any]] = None
    ) -> PromptTemplate:
        """
        創建新的提示詞模板
        
        Args:
            db: 數據庫會話
            category: 知識領域
            name: 模板名稱
            template_content: 模板內容
            description: 模板描述
            version: 版本號
            parameters: 模板參數
            
        Returns:
            創建的模板對象
        """
        # 將同分類的其他模板設為非活動狀態
        db.query(PromptTemplate).filter(
            PromptTemplate.category == category,
            PromptTemplate.is_active == True
        ).update({"is_active": False})
        
        # 創建新模板
        template = PromptTemplate(
            category=category,
            name=name,
            description=description,
            template_content=template_content,
            version=version,
            is_active=True,
            parameters=parameters
        )
        
        db.add(template)
        db.commit()
        db.refresh(template)
        
        logger.info(f"創建新模板: {name} (分類: {category}, 版本: {version})")
        
        return template
    
    def list_templates(
        self,
        db: Session,
        category: Optional[QACategory] = None,
        active_only: bool = True
    ) -> list[PromptTemplate]:
        """
        列出模板
        
        Args:
            db: 數據庫會話
            category: 知識領域（可選）
            active_only: 是否只返回活動模板
            
        Returns:
            模板列表
        """
        query = db.query(PromptTemplate)
        
        if category:
            query = query.filter(PromptTemplate.category == category)
        
        if active_only:
            query = query.filter(PromptTemplate.is_active == True)
        
        return query.order_by(PromptTemplate.created_at.desc()).all()


# 創建全局模板管理器實例
prompt_manager = PromptManager()

