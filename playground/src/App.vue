<script setup lang="ts">
import { transformJsxToString } from 'unplugin-jsx-string/src/cores'

const { copy } = useClipboard()

const code = $ref(
  `
console.log(jsxToString(<div>Hello</div>))
console.log(jsxToString(<div className={\`Hello\` + ' World ' + true} />))
`.trim()
)
let result = $ref('')

const convert = () => {
  try {
    result = transformJsxToString(code, {
      debug: true,
      plugins: ['jsx', 'typescript'],
    }).code
  } catch (err: any) {
    result = err.toString()
  }
}

const copyOutput = async () => {
  await copy(result)
  // eslint-disable-next-line no-alert
  alert('Copied!')
}

watch($$(code), () => convert(), { immediate: true })
</script>

<template>
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <app-header />

    <div py-4 />

    <code-input v-model="code" placeholder="Paste your code" />

    <div py-4>Output</div>

    <code-input :model-value="result" readonly />

    <div>
      <button
        text-sm
        btn
        flex="inline gap-1"
        items-center
        :disabled="!code"
        @click="copyOutput"
      >
        <div i-carbon-copy inline-block />
        Copy
      </button>
    </div>

    <app-footer />
  </main>
</template>
