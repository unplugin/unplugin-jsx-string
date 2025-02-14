import type { ParserPlugin } from '@babel/parser'
import type { FilterPattern } from 'unplugin-utils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  debug?: boolean
  /**
   * Plugins for `@babel/parser`
   *
   * If filename ends with `.tsx`, `typescript` will be automatically added to the default value.
   * @default `['jsx']` or `['jsx', 'typescript']`.
   */
  plugins?: ParserPlugin[]
  enforce?: 'pre' | 'post' | undefined
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type OptionsResolved = Overwrite<
  Required<Options>,
  Pick<Options, 'enforce'>
>

export function resolveOptions(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[jt]sx$/],
    exclude: options.exclude || [/node_modules/],
    debug: options.debug ?? false,
    plugins: ['jsx'],
    enforce: 'enforce' in options ? options.enforce : 'pre',
  }
}
