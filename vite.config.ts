import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Levis Pokémon-Karten',
        short_name: 'PokéLevi',
        description: 'Pokémon Trading Card Game für Levi',
        theme_color: '#fbbf24',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}', 'audio/bgm/*.m4a', 'audio/sfx/*.m4a'],
        globIgnores: ['**/audio/voice/cards/**', '**/audio/cries/**'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'audio' ||
              url.pathname.startsWith('/audio/voice/cards/') ||
              url.pathname.startsWith('/audio/cries/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-voice-and-cries-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
