<script lang="ts" setup>
import { ElDialog } from 'element-plus'

const show = defineModel<boolean>({ required: true })
</script>

<template>
  <ElDialog
    v-model="show"
    title="日志查看"
    width="500"
    align-center
    destroy-on-close
    :z-index="20"
  >
    <span>Log</span>
    <template #footer>
      <div>
        <el-button @click="show = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="show = false">
          Confirm
        </el-button>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped></style>
