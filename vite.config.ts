import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  base: '/PaymentReminderApp/',
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    mkcert({ hosts: ['localhost', '127.0.0.1', '192.168.1.104'], force: true }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'data/recurring_bills.json'],
      manifest: {
        name: 'Payment Reminder',
        short_name: 'Payments',
        description: 'Track upcoming recurring payments',
        theme_color: '#06D6A0',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: '/PaymentReminderApp/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
          },
        ],
      },
    }),
  ],
})
