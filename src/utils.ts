import JSON5 from 'json5'
import { kebabCase } from 'lodash'

export const styleToString = (styles: Record<string, string>) =>
  Object.entries(styles)
    .map(([key, value]) => `${kebabCase(key)}:${value}`)
    .join(';')

export const normalizeObjectString = (text: string) =>
  JSON.stringify(JSON5.parse(text))
