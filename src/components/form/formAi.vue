<script lang="ts" setup>
import { ElButton, ElButtonGroup } from "element-plus";
import { useFormData } from "@/pages/web/geek/job/hooks/useForm";
import { FormDataAi } from "@/types/formData";
import settingsVue from "@/components/icon/settings.vue";
const { deliverLock, confSaving } = useFormData();

const props = defineProps<{
  label: string;
  help?: string;
  disabled?: boolean;
  data: FormDataAi;
}>();
function change(v: FormDataAi) {
  v.enable = !v.enable;
  confSaving();
}
</script>

<template>
  <el-button-group :type="data.enable ? 'success' : 'danger'" :help>
    <el-button :disabled="deliverLock || disabled" @click="() => change(data)">
      {{ label }}
    </el-button>
    <el-button :icon="settingsVue" :disabled @click="$emit('show')" />
  </el-button-group>
</template>

<style lang="scss" scoped></style>
