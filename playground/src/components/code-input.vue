<script lang="ts" setup>
const value = defineModel<string>()
</script>

<template>
  <textarea
    v-model="value"
    p-2
    w-full
    max-w="800px"
    rows="15"
    font="mono"
    bg="transparent"
    border="~ rounded gray-200 dark:gray-700"
    outline="none active:none"
  />
</template>
