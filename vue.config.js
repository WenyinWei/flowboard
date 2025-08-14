import { defineConfig } from '@vue/cli-service'

export default defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    port: 8080,
    proxy: {
      // Proxy API requests to the Electron main process
      '/api': {
        target: 'http://localhost:3000', // This would be your Electron main process server
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
})