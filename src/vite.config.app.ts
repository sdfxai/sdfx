import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import electron, { startup } from 'vite-plugin-electron'
import pkg from './package.json'
import vueI18n from '@intlify/vite-plugin-vue-i18n'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

import { rmSync } from 'fs'
rmSync('dist_electron', { recursive: true, force: true }) // v14.14.0

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  optimizeDeps: {
    include: [],
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  plugins: [
    vue(),

    vueI18n({
      include: [path.resolve(process.cwd(), 'src/locales/**')],
    }),

    Components({
      dts: true,
      resolvers: [IconsResolver()],
      dirs: ['src/components', 'src/layout', 'src/views'],
      deep: true,
      extensions: ['vue'],
    }),

    Icons({
      'compiler': 'vue3'
    }), 

    electron([
      {
        entry: 'electron/main/index.ts',
        vite: {
          mode: process.env.NODE_ENV,
          build: {
            minify: isProd,
            sourcemap: isDev,
            outDir: 'dist_electron/electron/main',
          },
          plugins: [{
            name: 'plugin-start-electron',
            closeBundle() {
              if (isDev) {
                // Startup Electron App
                startup()
              }
            },
          }]
        }
      },
      
      {
        entry: path.join(__dirname, 'electron/preload/index.ts'),
        vite: {
          build: {
            sourcemap: 'inline',
            outDir: 'dist_electron/electron/preload',
          },
        },
      }
    ])
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@cropper': fileURLToPath(new URL('./src/components/CropperJSCustom', import.meta.url)),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      'fabric': 'fabric-pure-browser',
      'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
  
  server: process.env.VSCODE_DEBUG
    ? {
        host: pkg.debug.env.VITE_DEV_SERVER_HOSTNAME,
        port: pkg.debug.env.VITE_DEV_SERVER_PORT,
      }
    : undefined
})
