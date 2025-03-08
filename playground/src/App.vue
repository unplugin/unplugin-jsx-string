<script setup lang="ts">
import { transformJsxToString } from 'unplugin-jsx-string/api'

const { copy, copied } = useClipboard()

const code = $ref(
  `
// basic example
console.log(jsxToString(<div>Hello World: { true ? 1 + 2 + 3 : 'never!' }</div>))

// jsxRaw example
const t = Date.now()
console.log(jsxToString(<div>Now: { jsxRaw(Math.trunc(t / 1000)) }</div>))

// class name & style
console.log(jsxToString(<div className={[
  \`Hello\` + 'World' + true,
  'foo',
  'bar',
]} style={{ color: 'red', fontSize: '20px' }} />))
`.trim(),
)
let result = $ref('')

const convert = () => {
  try {
    result = transformJsxToString(code, {
      debug: true,
      plugins: ['jsx', 'typescript'],
    }).code
  } catch (error: any) {
    result = error.toString()
  }
}

const copyOutput = () => copy(result)

watch($$(code), () => convert(), { immediate: true })
</script>

<template>
  <main
    font-sans
    py10
    text="gray-700 dark:gray-200"
    flex="~ col"
    items-center
    gap4
  >
    <app-header />
    <code-input v-model="code" placeholder="Paste your code" />

    <div flex gap2 items-center>
      Output
      <button
        text-sm
        rounded
        hover="bg-active"
        p2
        :disabled="!code"
        @click="copyOutput"
      >
        <div
          :class="copied ? 'i-carbon:checkmark text-green' : 'i-carbon-copy'"
        />
      </button>
    </div>

    <code-input :model-value="result" readonly />
    <app-footer />
  </main>
</template>
