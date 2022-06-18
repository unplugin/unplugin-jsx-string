import { describe, expect, test } from 'vitest'

let n = 1
const s = 'str'

describe('convert', () => {
  test('basic usage', () => {
    expect(jsxToString(<div>Hello</div>)).toMatchInlineSnapshot(
      '"<div>Hello</div>"'
    )
    expect(jsxToString(<div />)).toMatchInlineSnapshot('"<div/>"')
  })

  describe('with attribute', () => {
    test('basic', () => {
      // @ts-expect-error
      expect(jsxToString(<div id={1} />)).toMatchInlineSnapshot(
        '"<div id=\\"1\\"/>"'
      )
      expect(jsxToString(<div className={`hello`} />)).toMatchInlineSnapshot(
        '"<div class=\\"hello\\"/>"'
      )
      expect(
        // @ts-expect-error
        jsxToString(<div data-id={{ id: 1 + 2 + true }} />)
      ).toMatchInlineSnapshot('"<div data-id=\\"{&quot;id&quot;:4}\\"/>"')
    })

    test('attribute name', () => {
      expect(jsxToString(<div aria-label="Close" />)).toMatchInlineSnapshot(
        '"<div aria-label=\\"Close\\"/>"'
      )
    })

    test('className', () => {
      expect(jsxToString(<div className="bar" />)).toMatchInlineSnapshot(
        '"<div class=\\"bar\\"/>"'
      )
      expect(
        // @ts-expect-error
        jsxToString(<div className={['bar', 'foo']} />)
      ).toMatchInlineSnapshot('"<div class=\\"bar foo\\"/>"')

      expect(
        // @ts-expect-error
        jsxToString(<div className={['bar', { foo: true }]} />)
      ).toMatchInlineSnapshot(
        '"<div class=\\"[&quot;bar&quot;,{&quot;foo&quot;:true}]\\"/>"'
      )
    })

    test('style', () => {
      expect(
        jsxToString(<div style={{ color: 'red', textAlign: 'center' }} />)
      ).toMatchInlineSnapshot(
        '"<div style=\\"color:red;text-align:center\\"/>"'
      )
      // @ts-expect-error
      expect(jsxToString(<div style="color:red" />)).toMatchInlineSnapshot(
        '"<div style=\\"color:red\\"/>"'
      )
    })

    test('boolean', () => {
      expect(
        jsxToString(<input type="checkbox" checked />)
      ).toMatchInlineSnapshot('"<input type=\\"checkbox\\" checked/>"')
      expect(
        jsxToString(<input type="checkbox" checked={true} />)
      ).toMatchInlineSnapshot('"<input type=\\"checkbox\\" checked/>"')
      expect(
        jsxToString(<input type="checkbox" checked={false} />)
      ).toMatchInlineSnapshot('"<input type=\\"checkbox\\"/>"')
      expect(
        // @ts-expect-error
        jsxToString(<input type="checkbox" checked="checked" />)
      ).toMatchInlineSnapshot(
        '"<input type=\\"checkbox\\" checked=\\"checked\\"/>"'
      )
    })

    test('event', () => {
      expect(
        jsxToString(<button onClick={() => 'clicked'}></button>)
      ).toMatchInlineSnapshot(
        '"<button onclick=\\"&apos;clicked&apos;\\"></button>"'
      )
      expect(
        jsxToString(
          <button
            onClick={function () {
              console.warn('clicked')
            }}
          ></button>
        )
      ).toMatchInlineSnapshot(`
          "<button onclick=\\"{
                        console.warn(&apos;clicked&apos;)
                      }\\"></button>"
        `)

      expect(
        // @ts-expect-error
        jsxToString(<button onClick={123}></button>)
      ).toMatchInlineSnapshot('"<button onclick=\\"123\\"></button>"')
    })
  })

  describe('with children', () => {
    test('basic', () => {
      expect(
        jsxToString(
          <div>
            <p>foo</p>
            <p>bar</p>
            <br />
            <div />
            123
          </div>
        )
      ).toMatchInlineSnapshot('"<div><p>foo</p><p>bar</p><br/><div/>123</div>"')
    })
  })

  test('space', () => {
    expect(
      jsxToString(
        // prettier-ignore
        <>
          <div /> foo <div /> bar        <div/>
          <div /> baz <div />



          qux     
          
          abc   
        </>
      )
    ).toMatchInlineSnapshot(
      '"<div/> foo <div/> bar        <div/><div/> baz <div/>qux abc"'
    )
  })

  test('comments', () => {
    expect(jsxToString(<>{/*hello*/}</>)).toMatchInlineSnapshot(
      '"<!--hello-->"'
    )
  })

  test('BinaryExpression', () => {
    // eslint-disable-next-line prefer-template
    expect(jsxToString(<>{`a` + 1 + 'b'}</>)).toMatchInlineSnapshot('"a1b"')
    // eslint-disable-next-line prefer-template
    expect(jsxToString(<>{`a` + true + false + 'b'}</>)).toMatchInlineSnapshot(
      '"atruefalseb"'
    )
    // @ts-expect-error
    expect(jsxToString(<>{1 + 2 + true}</>)).toMatchInlineSnapshot('"4"')
  })

  describe('Literal', () => {
    test('TemplateLiteral', () => {
      expect(jsxToString(<>{`basic`}</>)).toMatchInlineSnapshot('"basic"')
      expect(jsxToString(<>{`1${1}${2}b`}</>)).toMatchInlineSnapshot('"112b"')
      expect(jsxToString(<>{`1${1 + 2 + 3}b`}</>)).toMatchInlineSnapshot(
        '"16b"'
      )
      expect(
        jsxToString(
          // @ts-expect-error
          <>{`a${true}${false}b${null}${true + 1 + 2 + false}${
            // @ts-expect-error
            null + 1
          }${[]}${{}}`}</>
        )
      ).toBe(
        // @ts-expect-error
        `a${true}${false}b${null}${true + 1 + 2 + false}${null + 1}${[]}${{}}`
      )
    })

    test('BigIntLiteral', () => {
      expect(jsxToString(<>{1n}</>)).toMatchInlineSnapshot('"1"')
      expect(
        jsxToString(<>{100012301203123123123123n}</>)
      ).toMatchInlineSnapshot('"100012301203123123123123"')
    })

    test('Primitive Literal', () => {
      expect(jsxToString(<>{122}</>)).toMatchInlineSnapshot('"122"')
      expect(jsxToString(<>{'false"'}</>)).toMatchInlineSnapshot('"false\\""')
      expect(jsxToString(<>{false}</>)).toMatchInlineSnapshot('"false"')
      expect(jsxToString(<>{null}</>)).toMatchInlineSnapshot('"null"')
    })

    test('Object/Array Literal', () => {
      expect(jsxToString(<>{{}}</>)).toMatchInlineSnapshot('"{}"')
      expect(jsxToString(<>{[{ foo: 'bar' }]}</>)).toMatchInlineSnapshot(
        '"[{\\"foo\\":\\"bar\\"}]"'
      )
    })

    test('RegExpLiteral', () => {
      expect(jsxToString(<>{/a(.*)/g}</>)).toMatchInlineSnapshot('"/a(.*)/g"')
    })
  })

  describe('error', () => {
    test('without function', () => {
      expect(() => <div />).toThrowError()
      // @ts-expect-error
      expect(() => jsx(<div />)).toThrowError()
    })

    test('unsupported', () => {
      expect(() =>
        jsxToString(<div id={`a${s}`} />)
      ).toThrowErrorMatchingInlineSnapshot(
        '"Error: not supported Identifier: s"'
      )
      expect(() =>
        jsxToString(<div id={undefined} />)
      ).toThrowErrorMatchingInlineSnapshot(
        '"Error: not supported Identifier: undefined"'
      )
      expect(() =>
        jsxToString(<div>{...[]}</div>)
      ).toThrowErrorMatchingInlineSnapshot(
        '"Error: not supported JSXSpreadChild: {...[]}"'
      )
      expect(() =>
        jsxToString(<div tabIndex={n} />)
      ).toThrowErrorMatchingInlineSnapshot(
        '"Error: not supported Identifier: n"'
      )
      expect(() =>
        jsxToString(<div tabIndex={n++} />)
      ).toThrowErrorMatchingInlineSnapshot(
        '"Error: not supported UpdateExpression: n++"'
      )
      expect(() =>
        // @ts-expect-error
        jsxToString(<div className={[s, 'class']} />)
      ).toThrowErrorMatchingInlineSnapshot(
        '"Error: not supported Identifier: s"'
      )
    })
  })

  test('special characters', () => {
    expect(
      jsxToString(
        <div>
          `///\\\\`${233}${'foo'}
        </div>
      )
    ).toMatchInlineSnapshot('"<div>`///\\\\\\\\\\\\\\\\`$233$foo</div>"')
  })

  test('reference variable', () => {
    let i = 0
    expect(
      jsxToString(<div className={jsxRaw(i++)}>Hello</div>)
    ).toMatchInlineSnapshot('"<div class=\\"0\\">Hello</div>"')
    expect(jsxToString(<>{jsxRaw(i++)}</>)).toMatchInlineSnapshot('"1"')
  })
})
