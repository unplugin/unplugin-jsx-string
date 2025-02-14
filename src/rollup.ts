/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import JsxString from './index'

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import JsxString from 'unplugin-jsx-string/rollup'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const rollup = JsxString.rollup as typeof JsxString.rollup
export default rollup
export { rollup as 'module.exports' }
