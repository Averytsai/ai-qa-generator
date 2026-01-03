"""
AI模型服務
支持多種AI模型：OpenAI, Anthropic, Azure OpenAI等
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from enum import Enum

from app.config import settings
from app.utils.logger import logger
from app.utils.exceptions import AIModelError


class ModelProvider(str, Enum):
    """AI模型提供商"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    AZURE_OPENAI = "azure_openai"


class AIModelInterface(ABC):
    """AI模型接口抽象類"""
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        生成文本
        
        Args:
            prompt: 提示詞
            max_tokens: 最大token數
            temperature: 溫度參數（0-1）
            **kwargs: 其他參數
            
        Returns:
            生成的文本
        """
        pass
    
    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ):
        """
        流式生成文本（用於長時間生成）
        
        Args:
            prompt: 提示詞
            max_tokens: 最大token數
            temperature: 溫度參數
            **kwargs: 其他參數
            
        Yields:
            生成的文本片段
        """
        pass


class OpenAIModel(AIModelInterface):
    """OpenAI模型實現"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        """
        初始化OpenAI模型
        
        Args:
            api_key: OpenAI API Key（如果為None則從配置讀取）
            model: 模型名稱
        """
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise AIModelError("OpenAI SDK未安裝，請運行: pip install openai")
        
        self.api_key = api_key or settings.openai_api_key
        if not self.api_key:
            raise AIModelError("OpenAI API Key未配置")
        
        # 验证API Key格式
        if not self.api_key.startswith(('sk-', 'sk_')):
            logger.warning(f"OpenAI API Key格式可能不正确（应以sk-开头）")
        
        self.model = model
        try:
            # 尝试初始化客户端
            self.client = AsyncOpenAI(api_key=self.api_key)
            logger.info(f"OpenAI模型已初始化: {model}")
        except TypeError as e:
            # 处理版本兼容性问题
            if 'proxies' in str(e) or 'unexpected keyword' in str(e):
                logger.error(f"OpenAI SDK版本兼容性问题: {e}")
                logger.info("尝试使用基础初始化...")
                # 只传递api_key参数
                self.client = AsyncOpenAI(api_key=self.api_key)
            else:
                raise
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """生成文本"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
            
            if not response.choices or not response.choices[0].message.content:
                raise AIModelError("OpenAI返回空響應")
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI生成失敗: {e}")
            raise AIModelError(f"OpenAI生成失敗: {str(e)}")
    
    async def generate_stream(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ):
        """流式生成文本"""
        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
                **kwargs
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"OpenAI流式生成失敗: {e}")
            raise AIModelError(f"OpenAI流式生成失敗: {str(e)}")


class AnthropicModel(AIModelInterface):
    """Anthropic Claude模型實現"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-sonnet-20240229"):
        """
        初始化Anthropic模型
        
        Args:
            api_key: Anthropic API Key（如果為None則從配置讀取）
            model: 模型名稱
        """
        try:
            from anthropic import AsyncAnthropic
        except ImportError:
            raise AIModelError("Anthropic SDK未安裝，請運行: pip install anthropic")
        
        self.api_key = api_key or settings.anthropic_api_key
        if not self.api_key:
            raise AIModelError("Anthropic API Key未配置")
        
        self.model = model
        self.client = AsyncAnthropic(api_key=self.api_key)
        logger.info(f"Anthropic模型已初始化: {model}")
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """生成文本"""
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                **kwargs
            )
            
            if not response.content or not response.content[0].text:
                raise AIModelError("Anthropic返回空響應")
            
            return response.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Anthropic生成失敗: {e}")
            raise AIModelError(f"Anthropic生成失敗: {str(e)}")
    
    async def generate_stream(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ):
        """流式生成文本"""
        try:
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                **kwargs
            ) as stream:
                async for text in stream.text_stream:
                    yield text
                    
        except Exception as e:
            logger.error(f"Anthropic流式生成失敗: {e}")
            raise AIModelError(f"Anthropic流式生成失敗: {str(e)}")


class AIModelManager:
    """AI模型管理器"""
    
    def __init__(self):
        """初始化模型管理器"""
        self._models: Dict[str, AIModelInterface] = {}
        self._default_provider = ModelProvider.OPENAI
        self._initialize_models()
    
    def _initialize_models(self):
        """初始化可用的模型"""
        # 初始化OpenAI
        if settings.openai_api_key:
            try:
                self._models[ModelProvider.OPENAI] = OpenAIModel(
                    model=settings.default_model
                )
                logger.info("OpenAI模型已註冊")
            except Exception as e:
                logger.warning(f"OpenAI模型初始化失敗: {e}")
        
        # 初始化Anthropic
        if settings.anthropic_api_key:
            try:
                self._models[ModelProvider.ANTHROPIC] = AnthropicModel()
                logger.info("Anthropic模型已註冊")
            except Exception as e:
                logger.warning(f"Anthropic模型初始化失敗: {e}")
        
        if not self._models:
            logger.warning("沒有可用的AI模型，請檢查API Key配置")
    
    def get_model(self, provider: Optional[ModelProvider] = None) -> AIModelInterface:
        """
        獲取AI模型實例
        
        Args:
            provider: 模型提供商（如果為None則使用默認）
            
        Returns:
            AI模型實例
            
        Raises:
            AIModelError: 如果模型不可用
        """
        provider = provider or self._default_provider
        
        if provider not in self._models:
            available = list(self._models.keys())
            raise AIModelError(
                f"模型 {provider} 不可用。可用模型: {available}"
            )
        
        return self._models[provider]
    
    def set_default_provider(self, provider: ModelProvider):
        """設置默認模型提供商"""
        if provider not in self._models:
            raise AIModelError(f"模型 {provider} 不可用")
        self._default_provider = provider
        logger.info(f"默認模型提供商已設置為: {provider}")
    
    def list_available_models(self) -> List[str]:
        """列出所有可用的模型"""
        return list(self._models.keys())
    
    async def generate(
        self,
        prompt: str,
        provider: Optional[ModelProvider] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        使用指定模型生成文本
        
        Args:
            prompt: 提示詞
            provider: 模型提供商
            max_tokens: 最大token數
            temperature: 溫度參數
            **kwargs: 其他參數
            
        Returns:
            生成的文本
        """
        model = self.get_model(provider)
        return await model.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )
    
    async def generate_with_retry(
        self,
        prompt: str,
        provider: Optional[ModelProvider] = None,
        max_retries: int = 3,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        帶重試機制的生成
        
        Args:
            prompt: 提示詞
            provider: 模型提供商
            max_retries: 最大重試次數
            max_tokens: 最大token數
            temperature: 溫度參數
            **kwargs: 其他參數
            
        Returns:
            生成的文本
        """
        last_error = None
        
        for attempt in range(max_retries):
            try:
                return await self.generate(
                    prompt=prompt,
                    provider=provider,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    **kwargs
                )
            except AIModelError as e:
                last_error = e
                logger.warning(f"生成失敗（嘗試 {attempt + 1}/{max_retries}）: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # 指數退避
                else:
                    raise
        
        raise last_error


# 創建全局模型管理器實例
import asyncio

# 延迟初始化，避免模块导入时就初始化
_model_manager_instance = None

def get_model_manager() -> AIModelManager:
    """获取模型管理器实例（延迟初始化）"""
    global _model_manager_instance
    if _model_manager_instance is None:
        _model_manager_instance = AIModelManager()
    return _model_manager_instance

# 为了向后兼容，创建一个属性
class ModelManagerProxy:
    """模型管理器代理，支持延迟初始化"""
    def __getattr__(self, name):
        return getattr(get_model_manager(), name)
    
    def reinitialize(self):
        """重新初始化模型管理器"""
        global _model_manager_instance
        _model_manager_instance = AIModelManager()
        return _model_manager_instance

model_manager = ModelManagerProxy()

