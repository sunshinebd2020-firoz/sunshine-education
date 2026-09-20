import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    allowedHosts: ["sunshine.test"],
    hmr: {
      host: "sunshine.test",
      protocol: "ws",
      clientPort: 80,
    },
    proxy: {
      "/api": {
        target: "http://api.sunshine.test",
        changeOrigin: true,
      },
      "/sunshine-api": {
        target: "http://api.sunshine.test",
        changeOrigin: true,
      },
    },
  },
})
