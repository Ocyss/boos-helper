<script lang="ts" setup>
import { ElSelect, ElOption } from "element-plus";
const value = defineModel<string[]>("value", { required: true });
const options = defineModel<string[]>("options", { required: true });
</script>

<template>
  <el-select
    v-model="value"
    multiple
    filterable
    allow-create
    default-first-option
    :reserve-keyword="false"
    style="width: 240px"
    placeholder=""
  >
    <el-option
      v-for="item in options"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
</template>

<style lang="scss" scoped></style>
