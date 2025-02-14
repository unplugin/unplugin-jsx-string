/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import JsxString from './index'

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import JsxString from 'unplugin-jsx-string/vite'
 *
 * export default defineConfig({
 *   plugins: [Starter()],
 * })
 * ```
 */
const vite = JsxString.vite as typeof JsxString.vite
export default vite
export { vite as 'module.exports' }
