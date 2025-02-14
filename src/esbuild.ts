/**
 * This entry file is for esbuild plugin.
 *
 * @module
 */

import JsxString from './index'

/**
 * Esbuild plugin
 *
 * @example
 * ```ts
 * import { build } from 'esbuild'
 * import JsxString from 'unplugin-jsx-string/esbuild'
 * 
 * build({ plugins: [JsxString()] })
```
 */
const esbuild = JsxString.esbuild as typeof JsxString.esbuild
export default esbuild
export { esbuild as 'module.exports' }
