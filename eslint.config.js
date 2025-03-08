import { sxzz } from '@sxzz/eslint-config'
export default sxzz(
  {
    files: ['package.json'],
    rules: { 'sxzz/require-package-field': 'error' },
  },
  { vue: true },
)
