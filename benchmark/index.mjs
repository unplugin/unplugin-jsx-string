/* eslint-disable no-console */

import Benchmark from 'benchmark'
import { convert } from '../dist/cores.mjs'

const codes = [
  '<div>Hello World</div>',
  `<div><img src={'foo'} /><div></div></div>`,
]

const suite = new Benchmark.Suite()

for (const code of codes) {
  suite.add(code, () => convert(`jsxToString(${code})`))
}

suite
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .run()
