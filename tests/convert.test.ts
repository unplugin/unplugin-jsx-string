import { readFile } from 'fs/promises'
import { it } from 'vitest'
import { convert } from '../src'

it('convert', async () => {
  const code = await readFile('./tests/fixtures/basic.jsx', 'utf-8')
  // const result =
  convert(code)
  // console.log(code)
})
