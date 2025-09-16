import { sxzz } from '@sxzz/eslint-config'

export default sxzz({
  vue: true,
}).append({
  files: ['package.json'],
  rules: { 'sxzz/require-package-field': 'error' },
})
