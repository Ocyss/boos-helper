<script lang="ts" setup>
import { ElButton, ElButtonGroup } from "element-plus";
import { FormDataAi } from "@/types/formData";
import settingsVue from "@/components/icon/settings.vue";

const props = defineProps<{
  label: string;
  lock?: boolean;
  help?: string;
  disabled?: boolean;
  data: FormDataAi;
}>();

const emit = defineEmits<{
  (e: "change", data: FormDataAi): void;
  (e: "show"): void;
}>();
</script>

<template>
  <el-button-group :type="data.enable ? 'success' : 'danger'" :help>
    <el-button :disabled="lock || disabled" @click="$emit('change', data)">
      {{ label }}
    </el-button>
    <el-button :icon="settingsVue" :disabled @click="$emit('show')" />
  </el-button-group>
</template>

<style lang="scss" scoped></style>
