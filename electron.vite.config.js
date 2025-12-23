// electron.vite.config.js
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'electron/main/index.js'),
        output: {
          format: 'es',
          entryFileNames: 'index.mjs',
        },
      },
    },
  },

  preload: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'electron/preload/index.js'),
        output: {
          format: 'es',
          entryFileNames: 'index.mjs',
        },
      },
    },
  },

  renderer: {
    root: '.',
    plugins: [vue()],
    base: './',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      assetsDir: 'custom',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
  },
})
