import type { ParserPlugin } from '@babel/parser'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  debug?: boolean
  /**
   * Plugins for `@babel/parser`
   * @default `['typescript', 'jsx']`
   */
  plugins?: ParserPlugin[]
}

export type OptionsResolved = Required<Options>

export function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[jt]sx$/],
    exclude: options.exclude || undefined,
    debug: options.debug ?? false,
    plugins: ['typescript', 'jsx'],
  }
}
