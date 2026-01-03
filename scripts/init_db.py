#!/usr/bin/env python3
"""
初始化資料庫腳本
創建資料庫表結構和初始數據
"""
import sys
from pathlib import Path

# 添加專案根目錄到路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.services.database import init_db, check_db_connection
from app.utils.logger import logger


def main():
    """主函數"""
    print("=" * 50)
    print("資料庫初始化")
    print("=" * 50)
    
    # 檢查資料庫連接
    print("\n1. 檢查資料庫連接...")
    if not check_db_connection():
        print("❌ 資料庫連接失敗，請檢查配置")
        return 1
    
    print("✓ 資料庫連接成功")
    
    # 初始化資料庫表結構
    print("\n2. 創建資料庫表結構...")
    try:
        init_db()
        print("✓ 資料庫表結構創建成功")
    except Exception as e:
        print(f"❌ 資料庫初始化失敗: {e}")
        return 1
    
    print("\n" + "=" * 50)
    print("✓ 資料庫初始化完成！")
    print("=" * 50)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

