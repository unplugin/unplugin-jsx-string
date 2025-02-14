/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import JsxString from './index'

/**
 * Webpack plugin
 *
 * @example
 * ```js
 * // webpack.config.js
 * import JsxString from 'unplugin-jsx-string/webpack'
 *
 * default export {
 *  plugins: [JsxString()],
 * }
 * ```
 */
const webpack = JsxString.webpack as typeof JsxString.webpack
export default webpack
export { webpack as 'module.exports' }
