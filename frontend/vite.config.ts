import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      // Redirige todas las llamadas que empiecen por /api al backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Esta parte es vital para evitar errores de transferencia
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Log opcional para ver qué peticiones pasan por el proxy
            // console.log('Sending Request to the Target:', req.method, req.url);
          });
        },
      },
    },
  },
})