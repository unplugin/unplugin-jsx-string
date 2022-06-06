import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { encode } from 'entities'
import { isJSX, isLiteral } from '@babel/types'
import { normalizeObjectString, styleToString } from './utils'
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
  StringLiteral,
  TemplateLiteral,
} from '@babel/types'

export const convert = (code: string) => {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  const nodes: JSX[] = []
  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === 'Identifier' &&
        path.node.callee.name === 'toString' &&
        isJSX(path.node.arguments[0])
      )
        nodes.push(path.node.arguments[0])
    },
  })

  const result = nodes.map((node) => jsxToString(node))

  for (const r of result) {
    console.log('\n', r)
  }

  function jsxToString(node: JSX): string {
    switch (node.type) {
      case 'JSXElement':
        return jsxElementToString(node)
      case 'JSXFragment':
        return jsxChildrenToString(node.children)
      case 'JSXText':
        return node.value
      case 'JSXEmptyExpression':
        return (
          node.innerComments
            ?.map((comment) => `<!--${comment.value}-->`)
            .join('') ?? ''
        )
      case 'JSXExpressionContainer':
        return expressionToString(node.expression)
      default:
        // TODO
        return ''
    }
  }

  function jsxElementToString(node: JSXElement) {
    if (node.openingElement.selfClosing) {
      return jsxOpeningElementToString(node.openingElement)
    } else {
      const children = jsxChildrenToString(node.children)
      return `${jsxOpeningElementToString(
        node.openingElement
      )}${children}</${nameToString(node.closingElement!.name)}>`
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
    let str = `<${nameToString(node.name)}`
    for (const attr of node.attributes) {
      if (attr.type === 'JSXAttribute') {
        str += ` ${jsxAttributeToString(attr)}`
      } else {
        // TODO
        // console.log(attr)
      }
    }
    str += node.selfClosing ? '/>' : '>'

    return str
  }

  function jsxAttributeToString(node: JSXAttribute) {
    let str = nameToString(node.name)

    if (str === 'className') str = 'class'
    else if (str.startsWith('on')) str = str.toLowerCase()

    if (node.value) {
      let value = valueToString(node.value)
      if (str === 'style') {
        value = styleToString(JSON.parse(value))
      } else if (str === 'class') {
        const classes = JSON.parse(value)
        if (Array.isArray(classes)) value = classes.join(' ')
      }
      str += `="${encode(value)}"`
    }
    return str
  }

  function nameToString(
    node: JSXIdentifier | JSXMemberExpression | JSXNamespacedName
  ) {
    if (node.type === 'JSXIdentifier') {
      return node.name
    } else {
      // TODO
      return ''
    }
  }

  function valueToString(
    node: JSXElement | JSXFragment | StringLiteral | JSXExpressionContainer
  ) {
    switch (node.type) {
      case 'StringLiteral':
        return node.value
      case 'JSXExpressionContainer':
        return expressionToString(node.expression)
      default:
        // TODO
        console.log(node)
        return ''
    }
  }

  function expressionToString(node: Expression | JSXEmptyExpression) {
    if (isLiteral(node)) {
      return literalToString(node)
    } else if (isJSX(node)) {
      return jsxToString(node)
    }

    switch (node.type) {
      case 'ArrayExpression':
      case 'ObjectExpression': {
        return normalizeObjectString(getSource(node))
      }
      default:
        return getSource(node)
    }
  }

  function literalToString(node: Literal) {
    switch (node.type) {
      case 'TemplateLiteral':
        return templateLiteralToString(node)
      case 'NullLiteral':
        return ''
      default:
        return String(node.extra?.rawValue ?? node.extra?.raw ?? '')
    }
  }

  function templateLiteralToString(node: TemplateLiteral) {
    if (node.expressions.length > 0) notSupported()
    return node.quasis.map((quasi) => quasi.value.cooked).join('')
  }

  function getSource(node: Node) {
    return code.slice(node.start!, node.end!)
  }
}

function notSupported(): never {
  throw new Error('not supported')
}
