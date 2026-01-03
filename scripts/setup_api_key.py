#!/usr/bin/env python3
"""
配置API Key助手脚本
"""
import os
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
env_file = project_root / ".env"

print("=" * 50)
print("API Key 配置助手")
print("=" * 50)

# 检查.env文件是否存在
if not env_file.exists():
    print("❌ .env文件不存在，请先创建")
    sys.exit(1)

# 读取.env文件
with open(env_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 检查当前配置
if 'OPENAI_API_KEY=your_openai_api_key_here' in content or 'OPENAI_API_KEY=' not in content:
    print("\n当前配置状态:")
    print("  ❌ OpenAI API Key 未配置或为示例值")
    print("\n请按以下步骤配置:")
    print("  1. 获取您的OpenAI API Key:")
    print("     https://platform.openai.com/api-keys")
    print("  2. 编辑 .env 文件，将:")
    print("     OPENAI_API_KEY=your_openai_api_key_here")
    print("     改为:")
    print("     OPENAI_API_KEY=sk-您的真实API密钥")
    print("\n或者运行以下命令（替换YOUR_API_KEY为您的真实Key）:")
    print(f"  sed -i '' 's|OPENAI_API_KEY=.*|OPENAI_API_KEY=YOUR_API_KEY|' {env_file}")
else:
    # 提取当前的API Key（隐藏部分）
    lines = content.split('\n')
    for line in lines:
        if line.startswith('OPENAI_API_KEY='):
            key_value = line.split('=', 1)[1]
            if key_value and key_value != 'your_openai_api_key_here':
                key_len = len(key_value)
                key_preview = key_value[:10] + "..." if key_len > 10 else key_value
                print(f"\n当前配置:")
                print(f"  API Key: {key_preview}")
                print(f"  长度: {key_len}")
                print(f"  格式: {'✅ 正确（以sk-开头）' if key_value.startswith('sk-') else '❌ 不正确（应以sk-开头）'}")
                
                if key_value.startswith('sk-') and key_len > 40:
                    print("\n✅ API Key配置看起来正确！")
                    print("\n验证配置:")
                    print("  运行: python scripts/test_ai_model.py")
                else:
                    print("\n⚠️  API Key格式可能不正确")
                    print("  正确格式: sk-开头，约51个字符")
            else:
                print("\n❌ API Key仍为示例值，需要配置真实Key")

print("\n" + "=" * 50)

