<script lang="ts" setup>
import { llms } from "@/hooks/useModel";

const formData = defineModel<Record<string, unknown>>({ required: true });
const props = defineProps<{
  data: (typeof llms)[number];
}>();
</script>

<template>
  <template v-for="(item, key) in props.data">
    <div v-if="'mode' in item" style="margin: 20px 0">
      <h3 v-html="item.desc"></h3>
    </div>
    <l-form-item v-else v-model="formData[key]" :label="key" :value="item" />
  </template>
</template>

<style lang="scss" scoped></style>
