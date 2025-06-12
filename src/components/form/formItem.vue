<script lang="ts" setup>
defineProps<{
  label: string
  help?: string
  disabled?: boolean
  includeOnly?: boolean
}>()

const include = defineModel<boolean | undefined>('include', {
  default: undefined,
})
const enable = defineModel<boolean>('enable', { required: true })
</script>

<template>
  <ElFormItem :data-help="help">
    <template #label>
      <ElCheckbox v-model="enable" :label size="small" />
      <ElLink
        v-if="includeOnly != null && include != null"
        :type="(includeOnly ?? include) ? 'primary' : 'warning'"
        size="small"
        :disabled
        @click.stop="include = !include"
      >
        {{ (includeOnly ?? include) ? "包含" : "排除" }}
      </ElLink>
    </template>
    <slot />
  </ElFormItem>
</template>

<style lang="scss" scoped></style>
