# 重启前端服务器

## 问题

前端代理可能没有正常工作，需要重启前端开发服务器。

## 解决方案

### 方法1: 手动重启前端服务器

1. **找到前端服务器进程**
   - 在运行 `npm run dev` 的终端窗口
   - 按 `Ctrl+C` 停止服务器

2. **重新启动**
   ```bash
   cd frontend
   npm run dev
   ```

### 方法2: 使用命令重启

```bash
# 停止前端服务器
pkill -f "vite"

# 等待2秒
sleep 2

# 重新启动
cd "/Users/caimingzhi/Desktop/企業app store/AVERY AI專案/AI 資料產生助手/frontend"
npm run dev
```

## 验证

重启后，访问 http://localhost:3000 应该能看到前端页面。

然后测试生成功能：
1. 填写表单
2. 点击"生成問答對"
3. 应该能正常工作了

## 如果问题仍然存在

请检查：
1. 前端服务器是否正常运行（访问 http://localhost:3000）
2. 后端服务器是否正常运行（访问 http://localhost:8000/health）
3. 浏览器控制台的错误信息

