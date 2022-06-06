import JSON5 from 'json5'
import { kebabCase } from 'lodash'

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
