import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared-types': fileURLToPath(new URL('../types', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    // 允许 VS Code Webview 访问
    cors: true
  },
  build: {
    outDir: '../out/webview',
    emptyOutDir: true
  }
});
