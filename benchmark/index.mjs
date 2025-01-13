/* eslint-disable no-console */

import Benchmark from 'benchmark'
import { transformJsxToString } from '../dist/api.mjs'

const codes = [
  '<div>Hello World</div>',
  `<div><img src={'foo'} /><div></div></div>`,
]

const suite = new Benchmark.Suite()

for (const code of codes) {
  suite.add(code, () =>
    transformJsxToString(`jsxToString(${code})`, {
      debug: true,
      plugins: ['jsx'],
    }),
  )
}

suite
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .run()
