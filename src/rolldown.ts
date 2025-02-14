/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import JsxString from './index'

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import JsxString from 'unplugin-jsx-string/rolldown'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const rolldown = JsxString.rolldown as typeof JsxString.rolldown
export default rolldown
export { rolldown as 'module.exports' }
