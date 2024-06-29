import { fileURLToPath } from 'url'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import vueI18n from '@intlify/vite-plugin-vue-i18n'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  optimizeDeps: {
    include: [],
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },

    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // creates some chunks, reducing the vendor chunk size
          if (id.includes('exifreader') || id.includes('heic2any')) return 'exif'
          if (id.includes('fabric')) return 'fabric'
          if (id.includes('LiteGraph')) return 'lg'

          if (
            id.includes('vue-') ||
            id.includes('install') ||
            id.includes('vueuse') ||
            id.includes('headlessui') ||
            id.includes('splidejs') ||
            id.includes('splitpanes') ||
            id.includes('v-contextmenu') ||
            id.includes('v-wave') ||
            id.includes('uuid') ||
            id.includes('axios') || 
            id.includes('mitt') || 
            id.includes('pinia')
          ) {
            return 'third'
          }
        }
      },
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

    splitVendorChunkPlugin()
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
