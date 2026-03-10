import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Anisha/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd'],
          'vendor-antd-icons': ['@ant-design/icons'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-utils': ['dayjs', 'axios'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
