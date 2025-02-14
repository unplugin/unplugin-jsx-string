/**
 * This entry file is for Rspack plugin.
 *
 * @module
 */

import JsxString from './index'

/**
 * Rspack plugin
 *
 * @example
 * ```js
 * // rspack.config.js
 * import JsxString from 'unplugin-jsx-string/rspack'
 *
 * default export {
 *  plugins: [JsxString()],
 * }
 * ```
 */
const rspack = JsxString.rspack as typeof JsxString.rspack
export default rspack
export { rspack as 'module.exports' }
