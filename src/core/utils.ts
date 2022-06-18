import jsesc from 'jsesc'

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g
export function kebabCase(str: string) {
  return str.replace(KEBAB_REGEX, (match) => {
    return `-${match.toLowerCase()}`
  })
}

export const styleToString = (styles: Record<string, string>) =>
  Object.entries(styles)
    .map(([key, value]) => `${kebabCase(key)}:${value}`)
    .join(';')

export const escapeString = (str: string) => `'${jsesc(str)}'`

export const isPrimitive = (val: unknown): val is Primitive => {
  if (typeof val === 'object') return val === null
  return typeof val !== 'function'
}

export const isPlainObject = (obj: unknown): obj is Record<any, any> => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
