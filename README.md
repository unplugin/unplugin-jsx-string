# unplugin-jsx-string [![npm](https://img.shields.io/npm/v/unplugin-jsx-string.svg)](https://npmjs.com/package/unplugin-jsx-string)

[![Unit Test](https://github.com/unplugin/unplugin-jsx-string/actions/workflows/unit-test.yml/badge.svg)](https://github.com/unplugin/unplugin-jsx-string/actions/workflows/unit-test.yml)

Converts JSX to HTML strings at compile time.

## Installation

```bash
npm i unplugin-jsx-string
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import JsxString from 'unplugin-jsx-string/vite'

export default defineConfig({
  plugins: [JsxString()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import JsxString from 'unplugin-jsx-string/rollup'

export default {
  plugins: [JsxString()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-jsx-string/esbuild')()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-jsx-string/webpack')()],
}
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [require('unplugin-jsx-string/webpack')()],
  },
}
```

<br></details>

#### TypeScript Support

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-jsx-string" /* ... */]
  }
}
```

## Usage

```tsx
// basic usage
jsxToString(<div>Hello</div>)
// "<div>Hello</div>"

// class list
jsxToString(<div className={['bar', 'foo']} />)
// `<div class="bar foo"/>`

// styles
jsxToString(<div style={{ color: 'red', textAlign: 'center' }} />)
// `<div style="color:red;text-align:center"/>`

// events
jsxToString(<button onClick={() => 'clicked'}></button>)
// "<button onclick="&apos;clicked&apos;"></button>"

// children
jsxToString(
  <div>
    <p>foo</p>
    <p>bar</p>
    <br />
    <div />
    123
  </div>
)
// "<div><p>foo</p><p>bar</p><br/><div/>123</div>"
```

## Benchmark

```
<div>Hello World</div> x 89,429 ops/sec ±0.88% (95 runs sampled)
<div><img src={'foo'} /><div></div></div> x 62,522 ops/sec ±0.62% (93 runs sampled)
```

<small>
Tested on Apple M1 Max / 32GB

_More samples are welcome._
</small>

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022-PRESENT [三咲智子](https://github.com/sxzz)
