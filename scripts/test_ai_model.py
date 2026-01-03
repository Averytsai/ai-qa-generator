#!/usr/bin/env python3
"""
测试AI模型初始化
"""
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.config import settings
from app.services.ai_model import model_manager
from app.utils.logger import logger

print("=" * 50)
print("AI模型诊断")
print("=" * 50)

print(f"\n1. OpenAI API Key配置:")
print(f"   已配置: {'是' if settings.openai_api_key else '否'}")
if settings.openai_api_key:
    key_len = len(settings.openai_api_key)
    key_preview = settings.openai_api_key[:10] + "..." if key_len > 10 else settings.openai_api_key
    print(f"   长度: {key_len}")
    print(f"   预览: {key_preview}")
    print(f"   格式正确: {'是' if settings.openai_api_key.startswith('sk-') else '否（应以sk-开头）'}")

print(f"\n2. 可用模型:")
available = model_manager.list_available_models()
print(f"   数量: {len(available)}")
if available:
    for model in available:
        print(f"   - {model}")
else:
    print("   无可用模型")

print(f"\n3. 尝试初始化OpenAI模型:")
try:
    from app.services.ai_model import OpenAIModel
    model = OpenAIModel()
    print("   ✅ OpenAI模型初始化成功")
    
    # 测试生成
    print(f"\n4. 测试生成（简短测试）:")
    import asyncio
    async def test():
        try:
            result = await model.generate("说'你好'", max_tokens=10)
            print(f"   ✅ 生成成功: {result[:50]}")
        except Exception as e:
            print(f"   ❌ 生成失败: {e}")
    
    asyncio.run(test())
    
except Exception as e:
    print(f"   ❌ 初始化失败: {e}")
    print(f"   错误类型: {type(e).__name__}")
    import traceback
    print(f"   详细错误:")
    traceback.print_exc()

print("\n" + "=" * 50)

