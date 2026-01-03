# 重启后端服务器指南

## 如果代码已更新但服务器没有重新加载

### 方法1: 手动重启（推荐）

1. **找到后端服务器进程**
   ```bash
   ps aux | grep uvicorn | grep -v grep
   ```

2. **停止服务器**
   - 找到进程ID（PID），然后：
   ```bash
   kill <PID>
   ```
   或者直接按 `Ctrl+C`（如果服务器在终端前台运行）

3. **重新启动服务器**
   ```bash
   cd "/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手"
   source venv/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 方法2: 触发自动重新加载

如果服务器使用了 `--reload` 标志，可以：

1. **触摸文件触发重新加载**
   ```bash
   touch app/api/v1/generator.py
   ```

2. **等待几秒钟**，服务器应该会自动重新加载

### 方法3: 使用脚本重启

```bash
# 停止所有uvicorn进程
pkill -f "uvicorn app.main:app"

# 等待2秒
sleep 2

# 重新启动
cd "/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手"
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
```

## 验证服务器已重新加载

1. **检查日志**
   ```bash
   tail -f logs/app.log
   ```
   应该看到 "應用程式啟動" 的消息

2. **测试API**
   ```bash
   curl http://localhost:8000/health
   ```
   应该返回 `{"status":"healthy"}`

3. **测试生成API**
   ```bash
   curl -X POST http://localhost:8000/api/v1/generator/generate \
     -H "Content-Type: application/json" \
     -d '{"category":"通用知识","count":1,"style":"专业"}'
   ```
   应该返回成功的JSON响应

## 如果问题仍然存在

1. 检查代码是否真的已保存
2. 检查是否有语法错误
3. 查看日志文件中的错误信息
4. 确认Python环境正确（虚拟环境已激活）

