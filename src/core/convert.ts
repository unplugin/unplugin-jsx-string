import { parse } from '@babel/parser'
import { walk } from 'estree-walker'
import { encode } from 'entities'
import {
  isBooleanLiteral,
  isCallExpression,
  isFunction,
  isIdentifier,
  isJSX,
  isJSXExpressionContainer,
  isLiteral,
  isStringLiteral,
} from '@babel/types'
import MagicString from 'magic-string'
import {
  escapeString,
  isPlainObject,
  isPrimitive,
  styleToString,
} from './utils'
import type { ParserPlugin } from '@babel/parser'
import type { Primitive } from './utils'
import type { OptionsResolved } from './options'
import type {
  ArrayExpression,
  Binary,
  CallExpression,
  Expression,
  JSX,
  JSXAttribute,
  JSXElement,
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
  ObjectExpression,
  TemplateLiteral,
  UnaryExpression,
} from '@babel/types'

export type EvaluatedValue =
  | Exclude<Primitive, symbol>
  | RegExp
  | Record<any, any>
  | any[]

function extractJsx(code: string, plugins: ParserPlugin[]) {
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

  return nodes
}

function transformJsx(code: string, node: JSX) {
  return escapeString(toStringJsx(node))

  function toStringJsx(node: JSX): string {
    return toStringExpression(resolveJsx(node))
  }

  function toStringExpression(expr: EvaluatedValue) {
    if (expr instanceof RegExp) {
      return expr.toString()
    } else if (typeof expr === 'object') {
      return JSON.stringify(expr)
    }
    return String(expr)
  }

  function toStringJsxChildren(
    nodes: Array<
      | JSXText
      | JSXExpressionContainer
      | JSXSpreadChild
      | JSXElement
      | JSXFragment
    >
  ) {
    return nodes.map((child) => toStringJsx(child)).join('')
  }

  function toStringJsxText(node: JSXText) {
    const texts = node.value.split('\n')

    return texts
      .map((text, idx) => (idx > 0 ? text.trim() : text))
      .filter((line) => {
        if (line.trim().length === 0) return false
        return true
      })
      .join(' ')
  }

  function toStringJsxElement(node: JSXElement) {
    if (node.openingElement.selfClosing) {
      return toStringOpeningElement(node.openingElement)
    } else {
      const children = toStringJsxChildren(node.children)
      return `${toStringOpeningElement(
        node.openingElement
      )}${children}</${toStringJsxName(node.closingElement!.name)}>`
    }

    function toStringOpeningElement(node: JSXOpeningElement) {
      let str = `<${toStringJsxName(node.name)}`

      const props: string[] = node.attributes
        .map((attr) => {
          if (attr.type === 'JSXAttribute') {
            return toStringJsxAttribute(attr)
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
  }

  function toStringJsxAttribute(node: JSXAttribute) {
    let name = toStringJsxName(node.name)

    if (name === 'className') name = 'class'
    else if (name.startsWith('on')) name = name.toLowerCase()

    let value: string | undefined
    if (node.value) {
      const rawValue = toStringJsxAttributeValue(node.value, name)
      if (rawValue === null) {
        return undefined
      }
      value = rawValue
    }

    return `${name}${value !== undefined ? `="${encode(value)}"` : ''}`
  }

  function toStringJsxAttributeValue(
    node: NonNullable<JSXAttribute['value']>,
    key: string
  ): string | undefined | null {
    // undefined for omiting attribute value
    // null for ignoring whole attribute
    let value: EvaluatedValue | undefined | null

    // foo={true}
    if (isJSXExpressionContainer(node) && isBooleanLiteral(node.expression)) {
      value = node.expression.value ? undefined : null
      // foo={() => {}}
    } else if (isJSXExpressionContainer(node) && isFunction(node.expression)) {
      value = getSource(node.expression.body)
    } else if (isJSX(node)) {
      value = resolveJsx(node)

      if (key === 'style' && isPlainObject(value)) {
        value = styleToString(value as Record<any, any>)
      } else if (
        key === 'class' &&
        Array.isArray(value) &&
        value.every((e) => isPrimitive(e))
      )
        value = value.join(' ')
    } else if (isStringLiteral(node)) {
      value = node.value
    }

    if (value === undefined || value === null) return value
    return toStringExpression(value)
  }

  function toStringJsxName(
    node: JSXIdentifier | JSXMemberExpression | JSXNamespacedName
  ) {
    if (node.type === 'JSXIdentifier') return node.name
    return notSupported(node)
  }

  function resolveJsx(node: JSX): EvaluatedValue {
    switch (node.type) {
      case 'JSXElement':
        return toStringJsxElement(node)
      case 'JSXFragment':
        return toStringJsxChildren(node.children)
      case 'JSXText':
        return toStringJsxText(node)
      case 'JSXEmptyExpression':
        return (
          node.innerComments
            ?.map((comment) => `<!--${comment.value}-->`)
            .join('') ?? ''
        )
      case 'JSXExpressionContainer': {
        return resolveExpression(node.expression)
      }
      default:
        return notSupported(node)
    }
  }

  function resolveExpression(node: Node, parent?: Node): EvaluatedValue {
    if (isLiteral(node)) {
      return resolveLiteral(node)
    } else if (isJSX(node)) {
      return resolveJsx(node)
    }

    switch (node.type) {
      case 'ArrayExpression':
        return resolveArrayExpression(node)
      case 'ObjectExpression':
        return resolveObjectExpression(node)
      case 'BinaryExpression':
      case 'LogicalExpression':
        return resolveBinary(node)
      case 'UnaryExpression':
        return resolveUnaryExpression(node)
      case 'ConditionalExpression':
        return resolveExpression(node.test, node)
          ? resolveExpression(node.consequent, node)
          : resolveExpression(node.alternate, node)
      case 'SequenceExpression': {
        const expressions = node.expressions.map((expr) =>
          resolveExpression(expr, node)
        )
        return expressions.slice(-1)[0]
      }
      case 'TSNonNullExpression':
        return resolveExpression(node.expression, node)
      case 'CallExpression':
        return resolveCallExpression(node, !parent)
      default:
        return notSupported(node)
    }
  }

  function resolveCallExpression(node: CallExpression, isTopLevel: boolean) {
    if (
      isTopLevel &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'jsxRaw'
    ) {
      return `__RAW_${getSource(node.arguments[0])}_RAW`
    }

    return notSupported(node)
  }

  function resolveBinary(node: Binary) {
    const left: any = resolveExpression(node.left, node)
    const right: any = resolveExpression(node.right, node)
    switch (node.operator) {
      case '+':
        return left + right
      case '-':
        return left - right
      case '*':
        return left * right
      case '/':
        return left / right

      // Logical operators
      case '&&':
        return left && right
      case '||':
        return left || right
      case '??':
        return left ?? right

      // Comparison operators
      case '==':
        return left == right
      case '!=':
        return left != right
      case '===':
        return left === right
      case '!==':
        return left !== right

      case '>':
        return left > right
      case '>=':
        return left >= right

      case '<':
        return left < right
      case '<=':
        return left <= right

      // Arithmetic operators
      case '%':
        return left % right
      case '**':
        return left ** right

      // Bitwise operators
      case '&':
        return left & right
      case '|':
        return left | right
      case '^':
        return left ^ right
      case '<<':
        return left << right
      case '>>':
        return left >> right
      case '>>>':
        return left >>> right

      // Relational operators
      case 'in':
        return left in right
      case 'instanceof':
        return left instanceof right

      default:
        notSupported(node)
    }
  }

  function resolveUnaryExpression(node: UnaryExpression) {
    const value: any = resolveExpression(node.argument, node)
    switch (node.operator) {
      case '!':
        return !value
      case '+':
        return +value
      case '-':
        return -value
      case 'typeof':
        return typeof value
      case 'void':
        return undefined
      case '~':
        return ~value

      default:
        notSupported(node)
    }
  }

  function resolveLiteral(node: Literal): EvaluatedValue {
    switch (node.type) {
      case 'TemplateLiteral':
        return resolveTemplateLiteral(node)
      case 'NullLiteral':
        return null
      case 'BigIntLiteral':
        return BigInt(node.value)
      case 'RegExpLiteral':
        return new RegExp(node.pattern, node.flags)

      case 'BooleanLiteral':
      case 'NumericLiteral':
      case 'StringLiteral':
        return node.value

      default:
        return notSupported(node)
    }
  }

  function resolveArrayExpression(node: ArrayExpression) {
    const items: any[] = []
    for (const [i, element] of node.elements.entries()) {
      if (element) items[i] = resolveExpression(element, node)
    }
    return items
  }

  function resolveObjectExpression(node: ObjectExpression) {
    const obj: Record<any, any> = {}
    for (const prop of node.properties) {
      if (prop.type !== 'ObjectProperty') return notSupported(prop)

      let key: any
      if (isIdentifier(prop.key) && !prop.computed) {
        key = prop.key.name
      } else {
        key = resolveExpression(prop.key, prop)
      }

      obj[key] = resolveExpression(prop.value, prop)
    }

    return obj
  }

  function resolveTemplateLiteral(node: TemplateLiteral) {
    return node.quasis.reduce((prev, curr, idx) => {
      if (node.expressions[idx]) {
        return (
          prev +
          curr.value.cooked +
          resolveExpression(node.expressions[idx], node)
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

export function transformJsxToString(
  code: string,
  {
    debug,
    plugins,
    id = '',
  }: Pick<OptionsResolved, 'debug' | 'plugins'> & { id?: string }
) {
  const s = new MagicString(code)

  if (id.endsWith('.tsx')) plugins.push('typescript')
  const nodes = extractJsx(code, plugins)

  for (const [node, expr] of nodes) {
    let str: string
    if (!debug) {
      str = transformJsx(code, node)
    } else {
      try {
        str = transformJsx(code, node)
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
}
