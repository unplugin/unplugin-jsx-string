import JSON5 from 'json5'
import jsesc from 'jsesc'

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

export const normalizeObjectString = (text: string) => {
  try {
    return JSON.stringify(JSON5.parse(text))
  } catch (err: any) {
    throw new SyntaxError(
      `Invalid attribute value: ${text}, error: ${err.message}`
    )
  }
}

export const escapeString = (str: string) => `'${jsesc(str)}'`
