import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { convert } from './core/convert'
import { resolveOption } from './core/options'
import type { Options } from './core/options'

declare global {
  const jsxToString: (element: JSX.Element) => string
}

export default createUnplugin<Options>((options = {}) => {
  const opt = resolveOption(options)
  const filter = createFilter(opt.include, opt.exclude)

  const name = 'unplugin-jsx-string'
  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },

    transform(code) {
      try {
        return convert(code, opt)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
