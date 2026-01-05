# 開發啟動指南 (Getting Started Guide)

## 📋 目錄
1. [環境配置](#環境配置)
2. [專案結構設置](#專案結構設置)
3. [開發流程建議](#開發流程建議)
4. [避免Debug的最佳實踐](#避免debug的最佳實踐)
5. [檢查清單](#檢查清單)

---

## 🔧 環境配置

### 1. Python 環境設置（必須先完成）

#### 1.1 使用虛擬環境（強烈建議）
```bash
# 創建虛擬環境
python3 -m venv venv

# 啟動虛擬環境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 確認虛擬環境已啟動（終端機前面會顯示 (venv)）
```

#### 1.2 安裝 Python 依賴管理工具
```bash
# 安裝 pip-tools（用於管理依賴版本）
pip install pip-tools

# 或使用 poetry（更現代的方式）
pip install poetry
```

### 2. 專案依賴管理

#### 2.1 創建依賴文件結構
```
requirements/
├── base.txt          # 基礎依賴（所有環境都需要）
├── dev.txt           # 開發環境依賴（測試、linter等）
└── prod.txt          # 生產環境依賴
```

#### 2.2 初始依賴清單（base.txt）
```txt
# Web框架
fastapi==0.104.1
uvicorn[standard]==0.24.0

# 資料庫
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1

# AI模型整合
openai==1.3.5
langchain==0.0.340
anthropic==0.7.7

# 資料驗證
pydantic==2.5.0
pydantic-settings==2.1.0

# 環境變數管理
python-dotenv==1.0.0

# 日誌
loguru==0.7.2
```

#### 2.3 開發依賴（dev.txt）
```txt
# 測試
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0

# 程式碼品質
black==23.11.0
flake8==6.1.0
mypy==1.7.0
isort==5.12.0
pylint==3.0.2

# 開發工具
ipython==8.18.1
```

### 3. 環境變數配置

#### 3.1 創建 `.env.example` 文件
```bash
# 資料庫配置
DATABASE_URL=postgresql://user:password@localhost:5432/qa_generator_db

# AI模型配置
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
AZURE_OPENAI_API_KEY=your_azure_key

# 應用配置
APP_ENV=development
SECRET_KEY=your_secret_key_here
DEBUG=True

# 日誌配置
LOG_LEVEL=INFO
```

#### 3.2 創建 `.env` 文件（不要提交到Git）
```bash
# 複製範例文件
cp .env.example .env

# 編輯 .env 填入實際值
```

#### 3.3 更新 `.gitignore`
```gitignore
# 環境變數
.env
.env.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 資料庫
*.db
*.sqlite

# 日誌
*.log
logs/
```

### 4. 資料庫設置

#### 4.1 PostgreSQL 安裝與配置
```bash
# macOS (使用 Homebrew)
brew install postgresql@15
brew services start postgresql@15

# 創建資料庫
createdb qa_generator_db

# 測試連線
psql qa_generator_db
```

#### 4.2 資料庫遷移工具設置
```bash
# 初始化 Alembic（資料庫遷移工具）
alembic init alembic

# 配置 alembic.ini 中的資料庫連線
```

---

## 📁 專案結構設置

### 建議的專案結構

```
AI資料產生助手/
├── .env                          # 環境變數（不提交）
├── .env.example                  # 環境變數範例
├── .gitignore                    # Git忽略文件
├── README.md                     # 專案說明
├── GETTING_STARTED.md           # 本文件
├── DEVELOPMENT_RULES.md          # 開發規則
├── DEVELOPMENT_PHASES.md        # 開發階段
│
├── requirements/                 # 依賴管理
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
│
├── alembic/                      # 資料庫遷移
│   ├── versions/
│   └── env.py
│
├── app/                          # 應用程式主目錄
│   ├── __init__.py
│   ├── main.py                   # FastAPI應用入口
│   ├── config.py                 # 配置管理
│   │
│   ├── api/                      # API路由
│   │   ├── __init__.py
│   │   ├── deps.py               # 依賴注入
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── generator.py      # 生成API
│   │       ├── reviewer.py       # 審查API
│   │       ├── feedback.py       # 反饋API
│   │       └── categories.py     # 分類API
│   │
│   ├── core/                     # 核心業務邏輯
│   │   ├── __init__.py
│   │   ├── generator.py          # 生成模組
│   │   ├── reviewer.py           # 審查模組
│   │   ├── feedback.py           # 反饋模組
│   │   └── learning.py           # 學習引擎
│   │
│   ├── models/                   # 資料庫模型
│   │   ├── __init__.py
│   │   ├── qa_pair.py
│   │   ├── review.py
│   │   ├── prompt_template.py
│   │   └── feedback_analysis.py
│   │
│   ├── schemas/                  # Pydantic模型
│   │   ├── __init__.py
│   │   ├── qa_pair.py
│   │   ├── review.py
│   │   └── generator.py
│   │
│   ├── services/                 # 服務層
│   │   ├── __init__.py
│   │   ├── ai_model.py           # AI模型服務
│   │   ├── prompt_manager.py     # 提示詞管理
│   │   └── database.py           # 資料庫服務
│   │
│   └── utils/                    # 工具函數
│       ├── __init__.py
│       ├── logger.py             # 日誌配置
│       └── exceptions.py         # 自定義異常
│
├── tests/                        # 測試
│   ├── __init__.py
│   ├── conftest.py               # pytest配置
│   ├── test_generator.py
│   ├── test_reviewer.py
│   └── test_api/
│
└── scripts/                      # 腳本
    ├── init_db.py                # 初始化資料庫
    └── seed_data.py              # 種子資料
```

---

## 🚀 開發流程建議

### 階段0：環境準備（必須先完成）

#### ✅ 檢查清單
- [ ] Python 3.10+ 已安裝
- [ ] 虛擬環境已創建並啟動
- [ ] 依賴套件已安裝
- [ ] `.env` 文件已配置
- [ ] PostgreSQL 已安裝並運行
- [ ] 資料庫已創建
- [ ] `.gitignore` 已正確配置
- [ ] Git 倉庫已初始化

### 階段1：基礎架構（先做這個）

#### 1.1 配置管理模組
**為什麼先做？** 所有模組都需要配置，先建立配置系統可以避免後續重複修改。

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    openai_api_key: str
    app_env: str = "development"
    
    class Config:
        env_file = ".env"
```

**驗證方式：**
- [ ] 可以成功讀取 `.env` 中的配置
- [ ] 配置驗證失敗時有明確錯誤訊息

#### 1.2 資料庫連接和模型
**為什麼先做？** 其他模組需要資料庫，先建立模型可以確保資料結構正確。

**步驟：**
1. 定義 SQLAlchemy 模型
2. 創建 Alembic 遷移文件
3. 執行遷移
4. 測試 CRUD 操作

**驗證方式：**
- [ ] 可以成功連接資料庫
- [ ] 可以創建表結構
- [ ] 可以執行基本的 CRUD 操作

#### 1.3 日誌系統
**為什麼先做？** 良好的日誌可以幫助快速定位問題，避免後續debug困難。

**驗證方式：**
- [ ] 日誌可以正常輸出
- [ ] 不同級別的日誌可以正確分類
- [ ] 日誌文件可以正確寫入

### 階段2：核心功能（逐步開發）

#### 開發順序建議

1. **AI模型管理器** → 2. **提示詞模板管理** → 3. **生成模組** → 4. **審查模組** → 5. **反饋模組** → 6. **學習引擎**

**為什麼這個順序？**
- AI模型管理器是基礎，其他模組都依賴它
- 提示詞模板是生成模組的依賴
- 生成和審查可以並行開發，但建議先完成生成
- 反饋模組依賴生成和審查的結果
- 學習引擎最後開發，因為需要前面所有模組的數據

#### 每個模組的開發流程

```
1. 設計介面（定義函數簽名、輸入輸出）
   ↓
2. 編寫單元測試（TDD方式，先寫測試）
   ↓
3. 實現功能（讓測試通過）
   ↓
4. 整合測試（測試與其他模組的互動）
   ↓
5. 文檔更新（更新API文檔、README）
```

---

## 🛡️ 避免Debug的最佳實踐

### 1. 類型提示（Type Hints）

**為什麼重要？** 可以在運行前發現類型錯誤，避免運行時錯誤。

```python
# ❌ 不好的寫法
def generate_qa(category, count):
    ...

# ✅ 好的寫法
from typing import List
from app.schemas.qa_pair import QAPair

def generate_qa(category: str, count: int) -> List[QAPair]:
    ...
```

**工具：**
- 使用 `mypy` 進行類型檢查
- IDE會自動提示類型錯誤

### 2. 輸入驗證（Pydantic）

**為什麼重要？** 在數據進入業務邏輯前就驗證，避免後續處理時出錯。

```python
from pydantic import BaseModel, Field, validator

class GenerateRequest(BaseModel):
    category: str = Field(..., description="知識領域")
    count: int = Field(..., ge=1, le=100, description="生成數量")
    
    @validator('category')
    def validate_category(cls, v):
        valid_categories = ['通用知識', '技術流程', '故障排除', '資安法規', '應用案例']
        if v not in valid_categories:
            raise ValueError(f'分類必須是: {valid_categories}')
        return v
```

### 3. 錯誤處理

**為什麼重要？** 明確的錯誤處理可以快速定位問題，避免錯誤傳播。

```python
# ✅ 好的錯誤處理
from app.utils.exceptions import GenerationError, ValidationError

async def generate_qa(request: GenerateRequest):
    try:
        # 驗證輸入
        if not request.category:
            raise ValidationError("分類不能為空")
        
        # 執行生成
        result = await ai_service.generate(request)
        
        if not result:
            raise GenerationError("生成失敗，請重試")
        
        return result
        
    except ValidationError as e:
        logger.error(f"驗證錯誤: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except GenerationError as e:
        logger.error(f"生成錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception(f"未預期的錯誤: {e}")
        raise HTTPException(status_code=500, detail="內部伺服器錯誤")
```

### 4. 日誌記錄

**為什麼重要？** 詳細的日誌可以幫助追蹤問題，避免盲目debug。

```python
from loguru import logger

logger.info(f"開始生成問答，分類: {category}, 數量: {count}")
logger.debug(f"使用的提示詞模板: {template_id}")
logger.warning(f"生成時間較長，已超過預期時間")
logger.error(f"生成失敗: {error}", exc_info=True)
```

### 5. 單元測試

**為什麼重要？** 測試可以確保功能正確，避免回歸錯誤。

```python
import pytest
from app.core.generator import QAGenerator

@pytest.mark.asyncio
async def test_generate_qa_success():
    """測試成功生成問答"""
    generator = QAGenerator()
    result = await generator.generate(
        category="通用知識",
        count=1
    )
    assert len(result) == 1
    assert result[0].question
    assert result[0].answer

@pytest.mark.asyncio
async def test_generate_qa_invalid_category():
    """測試無效分類"""
    generator = QAGenerator()
    with pytest.raises(ValueError):
        await generator.generate(
            category="無效分類",
            count=1
        )
```

### 6. 配置驗證

**為什麼重要？** 啟動時驗證配置，避免運行時才發現配置錯誤。

```python
# app/config.py
class Settings(BaseSettings):
    database_url: str = Field(..., description="資料庫URL")
    openai_api_key: str = Field(..., description="OpenAI API Key")
    
    @validator('database_url')
    def validate_database_url(cls, v):
        if not v.startswith('postgresql://'):
            raise ValueError('資料庫URL格式錯誤')
        return v
    
    @validator('openai_api_key')
    def validate_openai_key(cls, v):
        if not v or len(v) < 20:
            raise ValueError('OpenAI API Key格式錯誤')
        return v

# 啟動時驗證
settings = Settings()  # 如果配置錯誤，會立即報錯
```

### 7. 環境隔離

**為什麼重要？** 開發、測試、生產環境分離，避免環境問題。

```python
# app/config.py
class Settings(BaseSettings):
    app_env: str = Field(default="development")
    debug: bool = Field(default=False)
    
    @property
    def is_development(self) -> bool:
        return self.app_env == "development"
    
    @property
    def is_production(self) -> bool:
        return self.app_env == "production"
```

### 8. 資料庫遷移

**為什麼重要？** 版本控制的資料庫結構，避免手動修改資料庫。

```bash
# 創建遷移
alembic revision --autogenerate -m "創建問答對表"

# 執行遷移
alembic upgrade head

# 回滾
alembic downgrade -1
```

### 9. API文檔

**為什麼重要？** 自動生成的API文檔可以幫助測試和調試。

```python
# FastAPI 自動生成文檔
from fastapi import FastAPI

app = FastAPI(
    title="AI問答集生成系統",
    description="自動生成和審查問答對的系統",
    version="1.0.0"
)

# 訪問 http://localhost:8000/docs 查看文檔
```

### 10. 程式碼審查檢查清單

每個功能完成後，檢查：
- [ ] 類型提示完整
- [ ] 輸入驗證完善
- [ ] 錯誤處理完整
- [ ] 日誌記錄充分
- [ ] 單元測試通過
- [ ] 無 linter 錯誤
- [ ] 文檔已更新

---

## ✅ 檢查清單

### 環境準備檢查
- [ ] Python 3.10+ 已安裝
- [ ] 虛擬環境已創建並啟動
- [ ] 所有依賴已安裝（`pip install -r requirements/base.txt`）
- [ ] `.env` 文件已配置並測試
- [ ] PostgreSQL 已安裝並運行
- [ ] 資料庫已創建
- [ ] 可以成功連接資料庫

### 專案結構檢查
- [ ] 專案結構已創建
- [ ] 所有必要的 `__init__.py` 文件已創建
- [ ] `.gitignore` 已配置
- [ ] Git 倉庫已初始化

### 開發工具檢查
- [ ] IDE 已配置（VSCode/PyCharm）
- [ ] Linter 已配置（flake8/black）
- [ ] 類型檢查工具已配置（mypy）
- [ ] 測試框架已配置（pytest）

### 第一個功能檢查
- [ ] 配置模組可以正常讀取環境變數
- [ ] 資料庫連接正常
- [ ] 可以執行簡單的資料庫操作
- [ ] 日誌系統正常運作

---

## 🎯 下一步

完成環境配置後，建議按照以下順序開始開發：

1. **配置管理** (`app/config.py`)
2. **資料庫模型** (`app/models/`)
3. **資料庫連接** (`app/services/database.py`)
4. **AI模型服務** (`app/services/ai_model.py`)
5. **提示詞管理** (`app/services/prompt_manager.py`)
6. **生成模組** (`app/core/generator.py`)

每個模組完成後，立即進行測試，確認無誤後再進行下一個。

---

## 📚 參考資源

- [FastAPI 文檔](https://fastapi.tiangolo.com/)
- [SQLAlchemy 文檔](https://docs.sqlalchemy.org/)
- [Pydantic 文檔](https://docs.pydantic.dev/)
- [Alembic 文檔](https://alembic.sqlalchemy.org/)
- [pytest 文檔](https://docs.pytest.org/)

---

## ❓ 常見問題

### Q: 為什麼要先配置環境？
A: 環境配置錯誤會導致後續所有開發都出問題，先確保環境正確可以避免重複debug。

### Q: 為什麼要使用虛擬環境？
A: 避免不同專案的依賴衝突，確保專案依賴版本一致。

### Q: 為什麼要先做配置和資料庫？
A: 這兩個是所有其他模組的基礎，先建立好可以避免後續重複修改。

### Q: 測試真的那麼重要嗎？
A: 是的，測試可以幫助你快速發現問題，避免問題累積到最後才發現。

