# 前端服务器已重启

## ✅ 已完成

前端开发服务器已在后台启动。

## 访问地址

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:8000

## 下一步

1. **打开浏览器访问**: http://localhost:3000

2. **硬刷新页面**（清除缓存）:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **测试生成功能**:
   - 填写表单
   - 点击"生成問答對"
   - 应该可以正常工作了！

## 如果前端服务器没有启动

手动启动：
```bash
cd frontend
npm run dev
```

## 查看前端服务器日志

```bash
tail -f /tmp/frontend.log
```

## 停止前端服务器

```bash
kill $(cat /tmp/frontend.pid)
```

或者找到进程：
```bash
pkill -f "vite"
```

