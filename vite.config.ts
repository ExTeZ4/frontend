import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Конфиг Vite: алиас "@" -> src, прокси на бэкенд, доступ с туннелей (ngrok и т.п.)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    // Разрешаем любые хосты, чтобы работали туннели для теста в Telegram
    allowedHosts: true,
    proxy: {
      // Запросы /api/* уходят на локальный бэкенд (поменяйте порт при необходимости)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
