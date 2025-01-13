import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

const resolve = (...paths: string[]) => path.resolve(__dirname, 'src', ...paths)

export default defineConfig({
  define: {
    'process.env.BABEL_TYPES_8_BREAKING': 'false',
  },
  plugins: [
    ReactivityTransform(),
    Vue(),
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      dirs: [resolve('composables')],
      vueTemplate: true,
      dts: resolve('typings/auto-import.d.ts'),
    }),
    Components({
      dts: resolve('typings/components.d.ts'),
    }),
    Unocss(),
  ],
})
