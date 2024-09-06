<script lang="ts" setup>
import { llmInfo, formElm, llmInfoVal } from "@/hooks/useModel/type";
import { llms } from "@/hooks/useModel";
import {
  ElInput,
  ElInputNumber,
  ElSelectV2,
  ElSlider,
  ElSwitch,
} from "element-plus";
import info from "@/components/icon/info.vue";
import { computed, onMounted } from "vue";
const props = defineProps<{
  value: llmInfoVal<unknown, { required: boolean }>;
  label: string | number | symbol;
  depth?: number;
}>();

const fromVal = defineModel<any>({ required: true });

function getComponent(elm: formElm["type"] | undefined) {
  switch (elm) {
    case "input":
      return { el: ElInput, defaultConf: {} };
    case "inputNumber":
      return { el: ElInputNumber, defaultConf: {} };
    case "select":
      return { el: ElSelectV2, defaultConf: { options: [] } };
    case "slider":
      return {
        el: ElSlider,
        defaultConf: { style: "margin: 0 10px;", showInput: true },
      };
    case "switch":
      return { el: ElSwitch, defaultConf: {} };
  }
  return { el: undefined, defaultConf: {} };
}

const { el, defaultConf } = getComponent(props.value.type);
</script>

<template>
  <template v-if="value && 'alert' in value">
    <el-alert
      :title="value.label || label.toString()"
      :description="value.desc"
      :type="value.alert"
      :closable="false"
      show-icon
      :style="`margin: 10px 0px 20px ${(props.depth || 0) * 10}px;`"
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
    :style="`margin-left: ${(props.depth || 0) * 10}px;`"
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
      :is="el"
      v-bind="{ ...defaultConf, ...value.config }"
    />
  </el-form-item>
</template>

<style lang="scss" scoped></style>
