import { defineConfig } from 'vite'; 
import react from '@vitejs/plugin-react'; 
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({ 
  //добавлено
  build: {
    assetsInclude: ['**/*.js'], // Включаем SW в сборку
  },
  //конец
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', 
      injectRegister: false, // отключаем автоматическую регистрацию
      workbox: {
        swSrc: 'custom-sw.js', 
      },
    
      manifest: {
        name: 'My Notes', 
        short_name: 'Notes', 
        start_url: '/',
        display: 'standalone', 
        background_color: '#ffffff', 
        theme_color: '#317EFB', 
        icons: [
          {
            src: 'icons/icon-192x192.png', 
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png', 
            sizes: '512x512',
            type: 'image/png',
          },
        ], 
      } 
    }),
  ], 
});
