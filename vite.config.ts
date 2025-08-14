import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  root: './',
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
