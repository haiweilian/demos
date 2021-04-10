import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// import legacy from '@vitejs/plugin-legacy'
import virtualFile from './plugins/my-virtual-file'
import transformFile from './plugins/my-transform-file'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    // legacy({
    //   targets: ['defaults', 'not IE 11']
    // }),
    virtualFile(),
    transformFile()
  ],
  // base: '/com/',
  build: {
    // lib: {
    //   entry: path.resolve(__dirname, 'src/main.js'),
    //   name: 'MyLib'
    // },
    // rollupOptions: {
    //   // 请确保外部化那些你的库中不需要的依赖
    //   external: ['vue'],
    //   output: {
    //     // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
    //     globals: {
    //       vue: 'Vue'
    //     }
    //   }
    // }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 可以导入文件 @import "/path/config.scss";
        additionalData: `$injectedColor: orange;`
      }
    }
  },
  server: {
    proxy : {
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
