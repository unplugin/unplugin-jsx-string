import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { createFilter } from 'unplugin-utils'
import { transformJsxToString } from './core/convert'
import { resolveOptions, type Options } from './core/options'

declare global {
  // @ts-expect-error missing JSX
  const jsxToString: (element: JSX.Element) => string
  const jsxRaw: (variable: any) => any
}

const JsxString: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (options = {}) => {
    const opt = resolveOptions(options)
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
  },
)

export default JsxString
