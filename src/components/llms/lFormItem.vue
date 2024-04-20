<script lang="ts" setup>
import { llmInfo, formElm, llmInfoVal } from "@/hooks/useModel/llms/type";
import { llms } from "@/hooks/useModel";
import {
  ElInput,
  ElInputNumber,
  ElSelect,
  ElSlider,
  ElSwitch,
} from "element-plus";
import info from "@/components/icon/info.vue";
import { computed, onMounted } from "vue";
const props = defineProps<{
  value: llmInfoVal<any>;
  label: string | number | symbol;
  depth?: number;
}>();
const fromVal = defineModel<any>({ required: true });
function getComponent(elm: formElm) {
  switch (elm) {
    case "input":
      return ElInput;
    case "inputNumber":
      return ElInputNumber;
    case "select":
      return ElSelect;
    case "slider":
      return ElSlider;
    case "switch":
      return ElSwitch;
  }
  return ElInput;
}
const marginLeft = computed(() => {
  return `margin-left: ${(props.depth || 0) * 10}px;`;
});
</script>

<template>
  <template v-if="value && 'alert' in value">
    <el-alert
      :title="value.label || label"
      :description="value.desc"
      :type="value.alert"
      :closable="false"
      show-icon
      :style="marginLeft"
    />
    <l-form-item
      v-for="(x, k) in value.value"
      v-model="fromVal[k]"
      :value="x"
      :label="k"
      :key="k"
      :depth="(depth || 0) + 1"
    />
  </template>
  <el-form-item
    v-else-if="value"
    :required="value.required"
    :style="marginLeft"
  >
    <template #label>
      <el-text size="large">
        {{ value.label || label }}
      </el-text>
      <el-tooltip
        v-if="value.desc"
        :content="`<span>${value.desc}</span>`"
        raw-content
      >
        <el-icon style="margin-left: 8px"><info></info></el-icon>
      </el-tooltip>
    </template>
    <component
      v-model="fromVal"
      :is="getComponent(value.type)"
      v-bind="value.config"
    />
  </el-form-item>
</template>

<style lang="scss" scoped></style>
