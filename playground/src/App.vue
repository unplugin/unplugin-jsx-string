<script setup lang="ts">
import { convert as convertCode } from 'unplugin-jsx-string/cores'
import { useClipboard } from '@vueuse/core'
import { isDark, toggleDark } from './composables/dark'

const { copy } = useClipboard()

const content = $ref(
  `
console.log(jsxToString(<div>Hello</div>))
console.log(jsxToString(<div className={\`hello\`} />))
`.trim()
)
let result = $ref('')

const convert = () => {
  try {
    result = convertCode(content, true).code
  } catch (err: any) {
    result = err.toString()
  }
}

const convertAndCopy = () => {
  convert()
  copy(result)
  alert('Copied!')
}
</script>

<template>
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <div i-carbon-automatic text-4xl inline-block />
    <p>
      <a href="https://jsx-string.sxzz.moe">JSX to String</a>
    </p>
    <p>
      <em text-sm op75>Converts JSX to HTML strings at compile time.</em>
    </p>

    <div py-4 />

    <textarea
      v-model="content"
      placeholder="Paste your code"
      autocomplete="false"
      p-2
      cols="60"
      rows="8"
      font="mono"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
    />

    <div>
      <button
        m-3
        text-sm
        btn
        flex="inline gap-1"
        items-center
        :disabled="!content"
        @click="convert"
      >
        <div i-carbon-automatic inline-block />
        Convert
      </button>

      <button
        text-sm
        btn
        flex="inline gap-1"
        items-center
        :disabled="!content"
        @click="convertAndCopy"
      >
        <div i-carbon-copy inline-block />
        Convert and Copy
      </button>
    </div>

    <pre>{{ result }}</pre>

    <nav text-xl mt-6 inline-flex gap-2>
      <button class="icon-btn !outline-none" @click="toggleDark()">
        <div v-if="isDark" i-carbon-moon />
        <div v-else i-carbon-sun />
      </button>

      <a
        class="icon-btn"
        i-carbon-logo-github
        rel="noreferrer"
        href="https://github.com/sxzz/unplugin-jsx-string"
        target="_blank"
        title="GitHub"
      />
    </nav>
  </main>
</template>
