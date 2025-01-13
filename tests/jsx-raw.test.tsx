/* eslint-disable prefer-template */
import { describe, expect, test } from 'vitest'

describe('jsxRaw', () => {
  test('basic', () => {
    const foo = 'bar'
    expect(jsxToString(<>{jsxRaw(foo)}</>)).toMatchInlineSnapshot('"bar"')
    expect(jsxToString(<>{jsxRaw(foo + 'hello')}</>)).toMatchInlineSnapshot(
      '"barhello"',
    )
    expect(jsxToString(<>{jsxRaw(foo + 'world')}</>)).toMatchInlineSnapshot(
      '"barworld"',
    )
  })

  test('update', () => {
    let i = 0
    expect(jsxToString(<>{jsxRaw(i++)}</>)).toMatchInlineSnapshot('"0"')
    expect(jsxToString(<>{jsxRaw(i++)}</>)).toMatchInlineSnapshot('"1"')
  })
})
