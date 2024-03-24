<script lang="ts" setup>
import { ref, h } from "vue";
import {
  ElButton,
  ElIcon,
  ElTag,
  ElTooltip,
  TableV2FixedDir,
  ElTableV2,
  ElAutoResizer,
} from "element-plus";

import type { Column } from "element-plus";

const columns: Column<any>[] = [
  {
    key: "title",
    title: "岗位名",

    width: 150,
  },
  {
    key: "state",
    title: "状态",
    width: 150,
    align: "center",
    cellRenderer: ({ cellData: name }) => h(ElTag, {}, name),
  },
  {
    key: "message",
    title: "信息",
    cellRenderer: () =>
      h([
        h(ElButton, { size: "small" }, "Edit"),
        h(ElButton, { size: "small", type: "danger" }, "Del"),
      ]),
    width: 150,
    align: "center",
  },
];

const data = ref([]);
</script>

<template>
  <!-- <iframe
    src="https://www.zhipin.com/web/geek/chat"
    frameborder="0"
    style="height: 1px; width: 1px; resize: both; overflow: auto"
  ></iframe> -->
  <el-auto-resizer>
    <template #default="{ width }">
      <el-table-v2
        :columns="columns"
        :data="data"
        :estimated-row-height="50"
        :expand-column-key="columns[0].key"
        :height="400"
        :width
      />
    </template>
  </el-auto-resizer>
</template>

<style lang="scss" scoped></style>
