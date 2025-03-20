<script lang="ts" setup>
import type { modelData } from '@/hooks/useModel'
import { llmsIcons, useModel } from '@/hooks/useModel'
import deepmerge from '@/utils/deepmerge'
import { exportJson, importJson } from '@/utils/jsonImportExport'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

const show = defineModel<boolean>({ required: true })
const { modelData, save, init } = useModel()

const createBoxShow = ref(false)

function del(d: modelData) {
  modelData.value = modelData.value.filter(v => d.key !== v.key)
  ElMessage.success('删除成功')
}

function copy(d: modelData) {
  d = jsonClone(d)
  d.key = new Date().getTime().toString()
  d.name = `${d.name} 副本`
  modelData.value.push(d)
  ElMessage.success('复制成功')
}

const createModelData = ref()

function edit(d: modelData) {
  createModelData.value = d
  createBoxShow.value = true
}

function newllm() {
  createModelData.value = undefined
  createBoxShow.value = true
}

function create(d: modelData) {
  if (d.key) {
    const old = modelData.value.find(v => v.key === d.key)
    if (old) {
      deepmerge(old, d, { clone: false })
    }
    else {
      d.key = new Date().getTime().toString()
      modelData.value.push(d)
    }
  }
  else {
    d.key = new Date().getTime().toString()
    modelData.value.push(d)
  }
  createBoxShow.value = false
}

function close() {
  init()
  show.value = false
}

function exportllm() {
  exportJson(jsonClone(modelData.value), 'Ai模型配置')
}

function importllm() {
  importJson<modelData[]>().then((data) => {
    modelData.value = data
    ElMessage.success('导入成功, 请手动保存')
  })
}
</script>

<template>
  <el-dialog
    v-model="show"
    title="Ai模型配置"
    width="70%"
    align-center
    destroy-on-close
    :z-index="20"
  >
    <el-alert title="注意" type="warning">
      会员模型暂时不支持输出 思考过程, 比如deepseekR1，但是不影响模型能力
    </el-alert>
    <el-table :data="modelData" style="width: 100%" table-layout="auto">
      <el-table-column label="模型">
        <template #default="scope">
          <div style="align-items: center; display: flex">
            <el-avatar
              :size="30"
              :style="{ '--el-avatar-bg-color': scope.row.color }"
            >
              <el-icon v-html="scope.row.vip != null ? llmsIcons.vip : llmsIcons[scope.row.data.mode]" />
            </el-avatar>
            <span style="margin-left: 8px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="scope">
          <el-text line-clamp="1">
            {{ scope.row.vip == null ? scope.row.data.url : scope.row.vip.description }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="管理">
        <template #default="scope">
          <div v-if="scope.row.vip == null" style="width: 200px;">
            <el-button
              link
              type="primary"
              size="small"
              @click="() => del(scope.row)"
            >
              删除
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="() => copy(scope.row)"
            >
              复制
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="() => edit(scope.row)"
            >
              编辑
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <createLLM
      v-if="createBoxShow"
      v-model="createBoxShow"
      :model="createModelData"
      @create="create"
    />

    <template #footer>
      <div>
        <el-button @click="close">
          取消
        </el-button>
        <el-button type="success" @click="exportllm">
          导出
        </el-button>
        <el-button type="success" @click="importllm">
          导入
        </el-button>
        <el-button type="primary" @click="newllm">
          新建
        </el-button>
        <el-button type="primary" @click="save">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
