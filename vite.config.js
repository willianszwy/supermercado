import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/supermercado/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'SwipeCart',
        short_name: 'SwipeCart',
        description: 'Lista de compras inteligente com gestos - arraste para marcar items',
        theme_color: '#1f498dff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/supermercado/',
        scope: '/supermercado/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})