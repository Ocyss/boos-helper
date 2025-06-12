<script lang="ts" setup>
import type { FormDataAi } from '@/types/formData'
import settingsVue from '@/components/icon/settings.vue'

defineProps<{
  label: string
  lock?: boolean
  help?: string
  disabled?: boolean
  data: Partial<FormDataAi>
}>()

defineEmits<{
  (e: 'change', data: Partial<FormDataAi>): void
  (e: 'show'): void
}>()
</script>

<template>
  <ElButtonGroup :type="data.enable ? 'success' : 'danger'" :data-help="help">
    <ElButton :disabled="lock || disabled" @click="$emit('change', data)">
      {{ label }}
    </ElButton>
    <ElButton :icon="settingsVue" :disabled @click="$emit('show')" />
  </ElButtonGroup>
</template>

<style lang="scss" scoped></style>
