<script lang="ts" setup>
import { ElLink, ElFormItem, ElCheckbox } from "element-plus";
const props = defineProps<{
  label: string;
  help?: string;
  disabled?: boolean;
}>();

const include = defineModel<boolean | undefined>("include", {
  default: undefined,
});
const enable = defineModel<boolean>("enable", { required: true });
</script>

<template>
  <el-form-item :help>
    <template #label>
      <el-checkbox v-model="enable" :label size="small" />
      <el-link
        v-if="include !== undefined"
        @click.stop="include = !include"
        :type="include ? 'primary' : 'warning'"
        size="small"
        :disabled
      >
        {{ include ? "包含" : "排除" }}
      </el-link>
    </template>
    <slot></slot>
  </el-form-item>
</template>

<style lang="scss" scoped></style>
