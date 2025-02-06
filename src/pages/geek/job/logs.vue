<script lang="ts" setup>
import type {
  TableV2Instance,
} from 'element-plus'
import { useLog } from '@/hooks/useLog'
import {
  ElAutoResizer,
  ElTableV2,
} from 'element-plus'
import { ref } from 'vue'

const tableRef = ref<TableV2Instance>()
const { data, columns } = useLog()

// watchEffect(() => {
//   tableRef.value?.scrollToRow(data.value.length - 1);
// });
</script>

<template>
  <ElAutoResizer :disable-height="true">
    <template #default="{ width }">
      <ElTableV2
        ref="tableRef"
        :columns="columns"
        :data="data"
        :height="360"
        :width
      />
    </template>
  </ElAutoResizer>
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
