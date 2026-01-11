import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: '../docs'
  },
  server: {
    port: 5050,
    proxy: {
      '/api': {
        target: 'http://localhost:5100',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // 允许在开发模式下测试 PWA
      },
      includeAssets: ['logo.png'],
      manifest: {
        name: '拼音数学小达人',
        short_name: '小达人',
        description: '儿童拼音打字与数学计算练习应用',
        theme_color: '#0ea5e9',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: 'logo.png',
            sizes: 'any',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,jpg,png,svg,wasm}']
      }
    })
  ]
})
