import { parse } from '@babel/parser'
import { walk } from 'estree-walker'
import { encode } from 'entities'
import {
  isArrayExpression,
  isBooleanLiteral,
  isCallExpression,
  isFunction,
  isIdentifier,
  isJSX,
  isJSXExpressionContainer,
  isLiteral,
  isObjectExpression,
  isStringLiteral,
} from '@babel/types'
import MagicString from 'magic-string'
import { escapeString, parseObject, styleToString } from './utils'
import type { OptionsResolved } from './options'
import type {
  Expression,
  JSX,
  JSXAttribute,
  JSXElement,
  JSXEmptyExpression,
  JSXExpressionContainer,
  JSXFragment,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXOpeningElement,
  JSXSpreadChild,
  JSXText,
  Literal,
  Node,
  PrivateName,
  TSType,
  TemplateLiteral,
} from '@babel/types'

export const convert = (code: string, { debug, plugins }: OptionsResolved) => {
  const ast = parse(code, {
    sourceType: 'module',
    plugins,
  })

  const nodes: [JSX, Expression][] = []

  walk(ast.program, {
    enter(node: Node) {
      let arg: Node
      if (
        isCallExpression(node) &&
        isIdentifier(node.callee, { name: 'jsxToString' }) &&
        isJSX((arg = node.arguments[0]))
      )
        nodes.push([arg, node])
    },
  })

  const s = new MagicString(code)
  for (const [node, expr] of nodes) {
    let str: string
    if (!debug) {
      str = escapeString(jsxToString(node))
    } else {
      try {
        str = escapeString(jsxToString(node))
      } catch (err: any) {
        str = `(() => { throw new Error(${escapeString(err.toString())}) })()`
      }
    }
    s.overwrite(expr.start!, expr.end!, str)
  }

  return {
    code: s.toString(),
    get map() {
      return s.generateMap()
    },
  }

  function jsxToString(node: JSX): string {
    switch (node.type) {
      case 'JSXElement':
        return jsxElementToString(node)
      case 'JSXFragment':
        return jsxChildrenToString(node.children)
      case 'JSXText':
        return jsxTextToString(node)
      case 'JSXEmptyExpression':
        return (
          node.innerComments
            ?.map((comment) => `<!--${comment.value}-->`)
            .join('') ?? ''
        )
      case 'JSXExpressionContainer': {
        const expr = resolveExpression(node.expression)
        return typeof expr === 'object' ? JSON.stringify(expr) : String(expr)
      }
      default:
        return notSupported(node)
    }
  }

  function jsxTextToString(node: JSXText) {
    const texts = node.value.split('\n')

    return texts
      .map((text, idx) => (idx > 0 ? text.trim() : text))
      .filter((line) => {
        if (line.trim().length === 0) return false
        return true
      })
      .join(' ')
  }

  function jsxElementToString(node: JSXElement) {
    if (node.openingElement.selfClosing) {
      return jsxOpeningElementToString(node.openingElement)
    } else {
      const children = jsxChildrenToString(node.children)
      return `${jsxOpeningElementToString(
        node.openingElement
      )}${children}</${jsxNameToString(node.closingElement!.name)}>`
    }
  }

  function jsxChildrenToString(
    nodes: Array<
      | JSXText
      | JSXExpressionContainer
      | JSXSpreadChild
      | JSXElement
      | JSXFragment
    >
  ) {
    return nodes.map((child) => jsxToString(child)).join('')
  }

  function jsxOpeningElementToString(node: JSXOpeningElement) {
    let str = `<${jsxNameToString(node.name)}`

    const props: string[] = node.attributes
      .map((attr) => {
        if (attr.type === 'JSXAttribute') {
          return jsxAttributeToString(attr)
        } else {
          return notSupported(node)
        }
      })
      .filter((x): x is string => x !== undefined)

    if (props.length > 0) {
      str += ` ${props.join(' ')}`
    }

    str += node.selfClosing ? '/>' : '>'

    return str
  }

  function jsxAttributeToString(node: JSXAttribute) {
    let name = jsxNameToString(node.name)

    if (name === 'className') name = 'class'
    else if (name.startsWith('on')) name = name.toLowerCase()

    let value: string | undefined
    if (node.value) {
      const rawValue = jsxAttrValueToString(node.value, name)
      if (rawValue === null) {
        return undefined
      }
      value = rawValue
    }

    return `${name}${value !== undefined ? `="${encode(value)}"` : ''}`
  }

  function jsxNameToString(
    node: JSXIdentifier | JSXMemberExpression | JSXNamespacedName
  ) {
    if (node.type === 'JSXIdentifier') {
      return node.name
    } else {
      return notSupported(node)
    }
  }

  function jsxAttrValueToString(
    node: NonNullable<JSXAttribute['value']>,
    key: string
  ): string | undefined | null {
    let value: string | undefined | null

    // foo={true}
    if (isJSXExpressionContainer(node) && isBooleanLiteral(node.expression)) {
      value = node.expression.value ? undefined : null
      // foo={() => {}}
    } else if (isJSXExpressionContainer(node) && isFunction(node.expression)) {
      value = getSource(node.expression.body)
    } else if (isJSX(node)) {
      value = jsxToString(node)

      if (
        isJSXExpressionContainer(node) &&
        (isObjectExpression(node.expression) ||
          isArrayExpression(node.expression))
      ) {
        if (key === 'style') {
          value = styleToString(JSON.parse(value))
        } else if (key === 'class') {
          const classes = JSON.parse(value)
          if (Array.isArray(classes)) value = classes.join(' ')
        }
      }
    } else if (isStringLiteral(node)) {
      value = node.value
    }

    return value
  }

  function resolveExpression(
    node: Expression | JSXEmptyExpression | PrivateName | TSType
  ): string | number | boolean | null {
    if (isLiteral(node)) {
      return resolveLiteral(node)
    } else if (isJSX(node)) {
      return jsxToString(node)
    }

    switch (node.type) {
      case 'ArrayExpression':
      case 'ObjectExpression':
        return parseObject(getSource(node))

      case 'BinaryExpression':
        // @ts-expect-error
        return resolveExpression(node.left) + resolveExpression(node.right)

      default:
        return notSupported(node)
    }
  }

  function resolveLiteral(node: Literal): string | number | boolean | null {
    switch (node.type) {
      case 'TemplateLiteral':
        return templateLiteralToString(node)
      case 'NullLiteral':
        return null

      case 'BigIntLiteral':
      case 'DecimalLiteral':
      case 'RegExpLiteral':
        return node.extra!.raw as string

      case 'BooleanLiteral':
      case 'NumericLiteral':
      case 'StringLiteral':
        return node.value
    }
  }

  function templateLiteralToString(node: TemplateLiteral) {
    return node.quasis.reduce((prev, curr, idx) => {
      if (node.expressions[idx]) {
        return (
          prev + curr.value.cooked + resolveExpression(node.expressions[idx])
        )
      }
      return prev + curr.value.cooked
    }, '')
  }

  function getSource(node: Node) {
    return code.slice(node.start!, node.end!)
  }

  function notSupported(node: Node): never {
    throw new Error(`not supported ${node.type}: ${getSource(node)}`)
  }
}
