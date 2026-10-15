import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Eudemus AI - Ai Course Generator',
        short_name: 'EudemusAI',
        description: 'Text-to-Learn AI Platform with Offline Course Support',
        theme_color: '#0e1117',
        background_color: '#0e1117',
        display: 'standalone',
        icons: [
          {
            src: '/assets/text-ai-course-logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ],
  server: {
    port: 5173,
  },
});