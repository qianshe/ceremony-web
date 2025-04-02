import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,  // 监听所有地址
    strictPort: false,  // 允许端口被占用时尝试其他端口
    hmr: {
      overlay: false,  // 禁用错误遮罩
      timeout: 30000,  // 增加超时时间
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 不进行路径重写，完全保留 /api 前缀
      },
    },
    watch: {
      usePolling: true,  // 使用轮询来监听文件变化
      interval: 1000,    // 轮询间隔
    },
    cors: true,  // 启用 CORS
  },
}) 