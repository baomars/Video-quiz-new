import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT) || 5400;
const BACKEND_PORT = Number(process.env.BACKEND_PORT) || 5410;

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  publicDir: '../public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src')
    }
  },
  server: {
    port: FRONTEND_PORT,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true
      },
      '/uploads': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true
      },
      '/assets': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true
      },
      '/cache': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true
      },
      '/renders': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true
      }
    }
  }
});
