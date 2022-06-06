import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { convert } from './core/convert'
import type { FilterPattern } from '@rollup/pluginutils'

declare global {
  const jsxToString: (element: JSX.Element) => string
}

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  debug?: boolean
}

export type OptionsResolved = Required<Options>

function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[jt]sx$/],
    exclude: options.exclude || undefined,
    debug: options.debug ?? false,
  }
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
        return convert(code, opt.debug)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})

export { convert }
