/// <reference types="vitest" />

import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    Vue({
      reactivityTransform: true,
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        'process.env.BABEL_TYPES_8_BREAKING': 'false',
        'process.platform': '"Darwin"',
        'Buffer.isBuffer': 'undefined',
      },
    },
  },
})
