<script lang="ts" setup>
import { llmInfo, formElm } from "@/hooks/useModel/llms/type";
import { llms } from "@/hooks/useModel";
import {
  ElInput,
  ElInputNumber,
  ElSelect,
  ElSlider,
  ElSwitch,
} from "element-plus";
import { onMounted, ref } from "vue";
import { reactiveComputed } from "@vueuse/core";

const props = defineProps<{
  data: (typeof llms)[number];
}>();
type r = Record<string, any>;
function dfs(res: r, data: r) {
  for (const key in data) {
    const v = data[key];
    if ("mode" in v) {
      continue;
    } else if ("alert" in v) {
      res[key] = {};
      dfs(res[key], v.value);
    } else res[key] = v.value;
  }
}
const from = reactiveComputed<r>(() => {
  const res = {};
  dfs(res, props.data);
  return res;
});
</script>

<template>
  <template v-for="(item, key) in props.data">
    <div v-if="'mode' in item" style="margin: 20px 0">
      <h3 v-html="item.desc"></h3>
    </div>
    <l-form-item v-else v-model="from[key]" :label="key" :value="item" />
  </template>
</template>

<style lang="scss" scoped></style>
@/hooks/useModel/type
