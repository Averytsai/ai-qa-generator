"""
更新數據庫中的狀態值從簡體中文改為繁體中文
需要先修改PostgreSQL枚舉類型，然後更新數據
"""
import sys
from pathlib import Path

# 添加項目根目錄到路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.services.database import SessionLocal, engine
from sqlalchemy import text

def update_status_values():
    """更新數據庫中的狀態值"""
    db = SessionLocal()
    try:
        print("開始更新數據庫...")
        
        # 步驟1: 先添加新的繁體中文值到枚舉類型
        print("步驟1: 添加新的繁體中文值到枚舉類型...")
        
        # 添加狀態值
        db.execute(text("ALTER TYPE qastatus ADD VALUE IF NOT EXISTS '待審查'"))
        db.execute(text("ALTER TYPE qastatus ADD VALUE IF NOT EXISTS '已審查'"))
        db.execute(text("ALTER TYPE qastatus ADD VALUE IF NOT EXISTS '已通過'"))
        db.execute(text("ALTER TYPE qastatus ADD VALUE IF NOT EXISTS '已拒絕'"))
        
        # 添加分類值
        db.execute(text("ALTER TYPE qacategory ADD VALUE IF NOT EXISTS '通用知識'"))
        db.execute(text("ALTER TYPE qacategory ADD VALUE IF NOT EXISTS '技術流程'"))
        db.execute(text("ALTER TYPE qacategory ADD VALUE IF NOT EXISTS '資安法規'"))
        db.execute(text("ALTER TYPE qacategory ADD VALUE IF NOT EXISTS '應用案例'"))
        
        db.commit()
        print("步驟1完成：已添加新的繁體中文值")
        
        # 步驟2: 使用CAST更新數據
        print("步驟2: 更新數據...")
        
        # 更新狀態值：簡體 -> 繁體
        status_mapping = {
            "待审查": "待審查",
            "已审查": "已審查",
            "已通过": "已通過",
            "已拒绝": "已拒絕",
        }
        
        # 更新分類值：簡體 -> 繁體
        category_mapping = {
            "通用知识": "通用知識",
            "技术流程": "技術流程",
            "资安法规": "資安法規",
            "应用案例": "應用案例",
        }
        
        # 更新狀態值（使用::text轉換來比較，然後CAST回枚舉）
        for old_status, new_status in status_mapping.items():
            result = db.execute(
                text("UPDATE qa_pairs SET status = CAST(:new_status AS qastatus) WHERE status::text = :old_status"),
                {"old_status": old_status, "new_status": new_status}
            )
            if result.rowcount > 0:
                print(f"更新狀態: {old_status} -> {new_status}, 影響 {result.rowcount} 條記錄")
        
        # 更新分類值
        for old_category, new_category in category_mapping.items():
            result = db.execute(
                text("UPDATE qa_pairs SET category = CAST(:new_category AS qacategory) WHERE category::text = :old_category"),
                {"old_category": old_category, "new_category": new_category}
            )
            if result.rowcount > 0:
                print(f"更新分類: {old_category} -> {new_category}, 影響 {result.rowcount} 條記錄")
        
        db.commit()
        print("數據庫更新完成！")
        
    except Exception as e:
        db.rollback()
        print(f"更新失敗: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_status_values()

