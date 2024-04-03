<script lang="ts" setup>
import { ElDialog, ElButton } from "element-plus";
const show = defineModel<boolean>({ required: true });
</script>

<template>
  <el-dialog
    v-model="show"
    title="存储配置"
    width="500"
    align-center
    destroy-on-close
    :z-index="20"
  >
    <span>
      当使用多账户时候,该配置内含有敏感信息,导入导出一定要注意,避免泄露
    </span>
    <template #footer>
      <div>
        <el-button @click="show = false">Cancel</el-button>
        <el-button type="primary" @click="show = false">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
