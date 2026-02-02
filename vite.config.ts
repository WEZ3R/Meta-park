import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let ip = '10.137.128.252' // Replace with your desired IP address

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://'+ip+':3001',
        changeOrigin: true
      },
      '/videos': {
        target: 'http://'+ip+':3001',
        changeOrigin: true
      },
      '/audio': {
        target: 'http://'+ip+':3001',
        changeOrigin: true
      },
      '/images': {
        target: 'http://'+ip+':3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
