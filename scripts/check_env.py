#!/usr/bin/env python3
"""
環境檢查腳本
用於驗證環境配置是否正確
"""
import sys
from pathlib import Path

# 添加專案根目錄到路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def check_python_version():
    """檢查Python版本"""
    print("✓ 檢查Python版本...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 9:
        print(f"  Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"  Python {version.major}.{version.minor}.{version.micro} - 建議使用 Python 3.9+")
        return False

def check_config():
    """檢查配置"""
    print("\n✓ 檢查配置...")
    try:
        from app.config import settings
        print(f"  應用名稱: {settings.app_name}")
        print(f"  環境: {settings.app_env}")
        print(f"  資料庫URL: {settings.database_url[:30]}..." if len(settings.database_url) > 30 else f"  資料庫URL: {settings.database_url}")
        print("  配置載入成功 ✓")
        return True
    except Exception as e:
        print(f"  配置載入失敗: {e}")
        print("  請確認 .env 文件已正確配置")
        return False

def check_imports():
    """檢查關鍵模組導入"""
    print("\n✓ 檢查模組導入...")
    try:
        from app.config import settings
        from app.utils.logger import logger
        from app.utils.exceptions import BaseAppException
        from app.main import app
        print("  所有關鍵模組導入成功 ✓")
        return True
    except ImportError as e:
        print(f"  模組導入失敗: {e}")
        print("  請確認已安裝所有依賴: pip install -r requirements/dev.txt")
        return False

def main():
    """主函數"""
    print("=" * 50)
    print("環境檢查")
    print("=" * 50)
    
    results = []
    results.append(check_python_version())
    results.append(check_config())
    results.append(check_imports())
    
    print("\n" + "=" * 50)
    if all(results):
        print("✓ 所有檢查通過！環境配置正確。")
        return 0
    else:
        print("✗ 部分檢查失敗，請根據上述提示修正。")
        return 1

if __name__ == "__main__":
    sys.exit(main())

