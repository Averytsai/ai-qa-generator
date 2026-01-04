import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 本地开发时，如果需要测试 Vercel Functions，可以使用代理
    // 或者直接使用 vercel dev 命令来运行本地 Functions
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000',  // Vercel dev 默认端口
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
})

