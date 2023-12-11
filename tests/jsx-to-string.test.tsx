/* eslint-disable no-void */
/* eslint-disable no-constant-condition */
/* eslint-disable prefer-template */
import { describe, expect, test } from 'vitest'

describe('jsxToString', () => {
  test('basic usage', () => {
    expect(jsxToString(<div>Hello</div>)).toMatchInlineSnapshot(
      '"<div>Hello</div>"',
    )
    expect(jsxToString(<div />)).toMatchInlineSnapshot('"<div/>"')
    expect(jsxToString(<>Hello</>)).toMatchInlineSnapshot('"Hello"')
  })

  describe('element attribute', () => {
    test('basic usage', () => {
      // @ts-expect-error
      expect(jsxToString(<div id={1} />)).toMatchInlineSnapshot(
        '"<div id="1"/>"',
      )
      expect(jsxToString(<div className={`hello`} />)).toMatchInlineSnapshot(
        '"<div class="hello"/>"',
      )
    })

    test('evaluate', () => {
      expect(
        jsxToString(<div className={`hello` + 'hello'} />),
      ).toMatchInlineSnapshot('"<div class="hellohello"/>"')
      expect(
        // @ts-expect-error
        jsxToString(<div data-id={{ id: 1 + 2 + true }} />),
      ).toMatchInlineSnapshot('"<div data-id="{&quot;id&quot;:4}"/>"')
    })

    test('attribute name', () => {
      expect(
        jsxToString(<div aria-label="Close" id="ok✅" />),
      ).toMatchInlineSnapshot('"<div aria-label="Close" id="ok&#x2705;"/>"')
    })

    test('className', () => {
      expect(jsxToString(<div className="bar" />)).toMatchInlineSnapshot(
        '"<div class="bar"/>"',
      )
      expect(
        // @ts-expect-error
        jsxToString(<div className={['bar', 'foo']} />),
      ).toMatchInlineSnapshot('"<div class="bar foo"/>"')

      expect(
        // @ts-expect-error
        jsxToString(<div className={['bar', { foo: true }]} />),
      ).toMatchInlineSnapshot(
        '"<div class="[&quot;bar&quot;,{&quot;foo&quot;:true}]"/>"',
      )
    })

    test('style', () => {
      expect(
        jsxToString(<div style={{ color: 'red', textAlign: 'center' }} />),
      ).toMatchInlineSnapshot('"<div style="color:red;text-align:center"/>"')
      // @ts-expect-error
      expect(jsxToString(<div style="color:red" />)).toMatchInlineSnapshot(
        '"<div style="color:red"/>"',
      )
    })

    test('boolean', () => {
      expect(
        jsxToString(<input type="checkbox" checked />),
      ).toMatchInlineSnapshot('"<input type="checkbox" checked/>"')
      expect(
        jsxToString(<input type="checkbox" checked={true} />),
      ).toMatchInlineSnapshot('"<input type="checkbox" checked/>"')
      expect(
        jsxToString(<input type="checkbox" checked={false} />),
      ).toMatchInlineSnapshot('"<input type="checkbox"/>"')
      expect(
        // @ts-expect-error
        jsxToString(<input type="checkbox" checked="checked" />),
      ).toMatchInlineSnapshot('"<input type="checkbox" checked="checked"/>"')
    })

    test('event', () => {
      expect(
        jsxToString(<button onClick={() => 'clicked'}></button>),
      ).toMatchInlineSnapshot(
        '"<button onclick="&apos;clicked&apos;"></button>"',
      )
      expect(
        jsxToString(
          <button
            onClick={function () {
              console.warn('clicked')
            }}
          ></button>,
        ),
      ).toMatchInlineSnapshot(`
          "<button onclick="{
                        console.warn(&apos;clicked&apos;)
                      }"></button>"
        `)

      expect(
        // @ts-expect-error
        jsxToString(<button onClick={123}></button>),
      ).toMatchInlineSnapshot('"<button onclick="123"></button>"')
    })
  })

  test('element children', () => {
    expect(
      jsxToString(
        <div>
          <p>foo</p>
          <p>bar</p>
          <br />
          <div />
          123
          <>foo</>
        </div>,
      ),
    ).toMatchInlineSnapshot(
      '"<div><p>foo</p><p>bar</p><br/><div/>123foo</div>"',
    )
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
        </>,
      ),
    ).toMatchInlineSnapshot(
      '"<div/> foo <div/> bar        <div/><div/> baz <div/>qux abc"',
    )
  })

  test('comments', () => {
    expect(jsxToString(<>{/*hello*/}</>)).toMatchInlineSnapshot(
      '"<!--hello-->"',
    )
  })

  describe('AST', () => {
    describe('Literal', () => {
      test('Primitive Literal', () => {
        expect(jsxToString(<>{122}</>)).toMatchInlineSnapshot('"122"')
        expect(jsxToString(<>{'false"'}</>)).toMatchInlineSnapshot('"false""')
        expect(jsxToString(<>{false}</>)).toMatchInlineSnapshot('"false"')
        expect(jsxToString(<>{null}</>)).toMatchInlineSnapshot('"null"')
      })

      test('TemplateLiteral', () => {
        expect(jsxToString(<>{`basic`}</>)).toMatchInlineSnapshot('"basic"')
        expect(jsxToString(<>{`1${1}${2}b`}</>)).toMatchInlineSnapshot('"112b"')
        expect(jsxToString(<>{`1${1 + 2 + 3}b`}</>)).toMatchInlineSnapshot(
          '"16b"',
        )
        expect(
          jsxToString(
            // @ts-expect-error
            <>{`a${true}${false}b${null}${true + 1 + 2 + false}${
              // @ts-expect-error
              null + 1
            }${[]}${{}}`}</>,
          ),
        ).toBe(
          // @ts-expect-error
          `a${true}${false}b${null}${true + 1 + 2 + false}${
            // @ts-expect-error
            null + 1
          }${[]}${{}}`,
        )
      })

      test('BigIntLiteral', () => {
        expect(jsxToString(<>{1n}</>)).toMatchInlineSnapshot('"1"')
        expect(
          jsxToString(<>{100012301203123123123123n}</>),
        ).toMatchInlineSnapshot('"100012301203123123123123"')
      })

      test('Object/Array Literal', () => {
        expect(jsxToString(<>{{}}</>)).toMatchInlineSnapshot('"{}"')
        expect(jsxToString(<>{[{ foo: 'bar' }]}</>)).toMatchInlineSnapshot(
          '"[{"foo":"bar"}]"',
        )
      })

      test('RegExpLiteral', () => {
        expect(jsxToString(<>{/a(.*)/g}</>)).toMatchInlineSnapshot('"/a(.*)/g"')
      })
    })

    test('BinaryExpression', () => {
      expect(jsxToString(<>{`a` + 1 + 'b'}</>)).toMatchInlineSnapshot('"a1b"')
      expect(
        jsxToString(<>{`a` + true + false + 'b'}</>),
      ).toMatchInlineSnapshot('"atruefalseb"')
      // @ts-expect-error
      expect(jsxToString(<>{1 + 2 + true}</>)).toMatchInlineSnapshot('"4"')
      expect(jsxToString(<>{1 - 2 + 3 / 5}</>)).toMatchInlineSnapshot('"-0.4"')
      expect(jsxToString(<>{2 ** 2}</>)).toMatchInlineSnapshot('"4"')
      expect(jsxToString(<>{false || 2}</>)).toMatchInlineSnapshot('"2"')
      expect(jsxToString(<>{null ?? 'foo'}</>)).toMatchInlineSnapshot('"foo"')
      expect(jsxToString(<>{1 && (false || 0.2)}</>)).toMatchInlineSnapshot(
        '"0.2"',
      )
      expect(jsxToString(<>{false === false}</>)).toMatchInlineSnapshot(
        '"true"',
      )
    })

    test('UnaryExpression', () => {
      expect(jsxToString(<>{!false}</>)).toMatchInlineSnapshot('"true"')
      expect(jsxToString(<>{typeof false}</>)).toMatchInlineSnapshot(
        '"boolean"',
      )
      expect(jsxToString(<>{~100}</>)).toMatchInlineSnapshot('"-101"')
      expect(jsxToString(<>{+-100}</>)).toMatchInlineSnapshot('"-100"')
      expect(jsxToString(<>{'foo' in { foo: true }}</>)).toMatchInlineSnapshot(
        '"true"',
      )
    })

    test('ConditionalExpression', () => {
      expect(jsxToString(<>{'1' ? 1 : 2}</>)).toMatchInlineSnapshot('"1"')
      expect(jsxToString(<>{void 1 ? 1 : 2}</>)).toMatchInlineSnapshot('"2"')
    })

    test('SequenceExpression', () => {
      // @ts-expect-error
      expect(jsxToString(<>{(1, 2, 3)}</>)).toMatchInlineSnapshot('"3"')
    })

    test('TSNonNullExpression', () => {
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
      expect(jsxToString(<>{1!!!!!}</>)).toMatchInlineSnapshot('"1"')
    })
  })

  describe('throw error', () => {
    test('unsupported', () => {
      let n = 1
      const s = 'str'

      expect(() =>
        jsxToString(<div id={`a${s}`} />),
      ).toThrowErrorMatchingInlineSnapshot(
        '[Error: Error: not supported Identifier: s]',
      )
      expect(() =>
        jsxToString(<div id={undefined} />),
      ).toThrowErrorMatchingInlineSnapshot(
        '[Error: Error: not supported Identifier: undefined]',
      )
      expect(() =>
        jsxToString(<div>{...[]}</div>),
      ).toThrowErrorMatchingInlineSnapshot(
        '[Error: Error: not supported JSXSpreadChild: {...[]}]',
      )
      expect(() =>
        jsxToString(<div tabIndex={n} />),
      ).toThrowErrorMatchingInlineSnapshot(
        '[Error: Error: not supported Identifier: n]',
      )
      expect(() =>
        jsxToString(<div tabIndex={n++} />),
      ).toThrowErrorMatchingInlineSnapshot(
        '[Error: Error: not supported UpdateExpression: n++]',
      )
      expect(() =>
        // @ts-expect-error
        jsxToString(<div className={[s, 'class']} />),
      ).toThrowErrorMatchingInlineSnapshot(
        '[Error: Error: not supported Identifier: s]',
      )
    })
  })

  test('special characters', () => {
    expect(
      jsxToString(
        <div>
          `///\\\\`${233}${'foo'}
        </div>,
      ),
    ).toMatchInlineSnapshot('"<div>`///\\\\\\\\`$233$foo</div>"')
  })
})
