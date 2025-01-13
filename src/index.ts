import { createFilter } from '@rollup/pluginutils'
import { createUnplugin } from 'unplugin'
import { transformJsxToString } from './core/convert'
import { resolveOption, type Options } from './core/options'

declare global {
  const jsxToString: (element: JSX.Element) => string
  const jsxRaw: (variable: any) => any
}

export default createUnplugin<Options | undefined, false>((options = {}) => {
  const opt = resolveOption(options)
  const filter = createFilter(opt.include, opt.exclude)

  const name = 'unplugin-jsx-string'
  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      try {
        return transformJsxToString(code, {
          ...opt,
          id,
        })
      } catch (error: unknown) {
        this.error(`${name} ${error}`)
      }
    },
  }
})
