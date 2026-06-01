import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Dev server requests should always hit the local backend.
  // Production builds do not use this proxy configuration.
  const backendTarget = mode === 'development'
    ? 'http://localhost:8080'
    : (env.VITE_API_BASE_URL || 'http://localhost:8080');

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, _req, _res) => {
              // Optional: trace proxied requests while debugging.
            });
          },
        },
      },
    },
  };
});
