#!/usr/bin/env python3
"""
生成 SECRET_KEY 的工具脚本
用于 Railway 环境变量配置
"""
import secrets

def generate_secret_key():
    """生成一个安全的随机密钥"""
    key = secrets.token_urlsafe(32)
    print("=" * 60)
    print("生成的 SECRET_KEY:")
    print("=" * 60)
    print(key)
    print("=" * 60)
    print("\n请复制上面的值，添加到 Railway 环境变量中：")
    print("Name: SECRET_KEY")
    print(f"Value: {key}")
    print("=" * 60)
    return key

if __name__ == "__main__":
    generate_secret_key()

