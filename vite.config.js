import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/English-site/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false, // Убираем CSS из сборки
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})