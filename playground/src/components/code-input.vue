<script lang="ts" setup>
defineProps<{
  modelValue: string
}>()

defineEmits<{
  (evt: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <textarea
    :value="modelValue"
    p-2
    w-full
    max-w="800px"
    rows="15"
    font="mono"
    bg="transparent"
    border="~ rounded gray-200 dark:gray-700"
    outline="none active:none"
    @input="
      $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
    "
  />
</template>
