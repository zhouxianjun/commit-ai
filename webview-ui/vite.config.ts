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
    emptyOutDir: true,
    // 禁用代码分割，不然需要处理异步加载chunk asWebview资源
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: () => 'index',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
