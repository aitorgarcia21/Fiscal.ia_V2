import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/client/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Francis Client',
        short_name: 'Francis',
        start_url: '/client/',
        display: 'standalone',
        background_color: '#1a2332',
        theme_color: '#1a2332',
        icons: [
          {
            src: '/client/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/client/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
}); 