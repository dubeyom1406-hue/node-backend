import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  assetsInclude: ['**/*.glb'],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // All /api/* routes → Java Backend (5001)
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Legacy direct routes pointing to Java
      '/login': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/register': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/send-otp': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/all-users': { target: 'http://127.0.0.1:5001', changeOrigin: true },
    }
  }
})