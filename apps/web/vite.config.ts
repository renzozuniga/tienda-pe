/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // En desarrollo la web llama a /api/* y Vite lo reenvía a la API sin el prefijo.
    proxy: {
      '/api': { target: apiTarget, rewrite: (path) => path.replace(/^\/api/, '') },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
