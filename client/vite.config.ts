import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const DEFAULT_API_PORT = 5000;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: env.VITE_API_URL
        ? undefined
        : {
            '/api': {
              target: `http://localhost:${DEFAULT_API_PORT}`,
              changeOrigin: true,
            },
          },
    },
  };
});
