<script lang="ts" setup>
import { ref, h, watchEffect } from "vue";
import {
  ElButton,
  ElIcon,
  ElTag,
  ElTooltip,
  TableV2FixedDir,
  ElTableV2,
  ElAutoResizer,
  TableV2Instance,
} from "element-plus";
import { useLog } from "./hooks/useLog";
import { onRowRenderedParams } from "element-plus/es/components/table-v2/src/grid";
const tableRef = ref<TableV2Instance>();
const { data, columns, Row } = useLog();

watchEffect(() => {
  tableRef.value?.scrollToRow(data.value.length - 1);
});
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
        ref="tableRef"
        :columns="columns"
        :data="data"
        :height="360"
        :width
      ></el-table-v2>
    </template>
  </el-auto-resizer>
</template>

<style lang="scss">
.el-table-v2__row-depth-0 {
  height: 50px;
}

.el-table-v2__cell-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
