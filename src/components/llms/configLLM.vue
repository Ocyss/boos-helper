<script lang="ts" setup>
import { ref, toRaw } from "vue";
import { useModel, type modelData, llmsIcons } from "@/hooks/useModel";
import { ElMessage } from "element-plus";
import deepmerge from "@/utils/deepmerge";
const show = defineModel<boolean>({ required: true });
const { modelData, save } = useModel();

const createBoxShow = ref(false);

function del(d: modelData) {
  modelData.value = modelData.value.filter((v) => d.key !== v.key);
  ElMessage.success("删除成功");
}

function copy(d: modelData) {
  d = JSON.parse(JSON.stringify(d));
  d.key = new Date().getTime().toString();
  d.name = d.name + " 副本";
  modelData.value.push(d);
  ElMessage.success("复制成功");
}
const createModelData = ref();
function edit(d: modelData) {
  createModelData.value = d;
  createBoxShow.value = true;
}
function newllm() {
  createModelData.value = undefined;
  createBoxShow.value = true;
}
function create(d: modelData) {
  if (d.key) {
    const old = modelData.value.find((v) => v.key == d.key);
    if (old) {
      deepmerge(old, d, { clone: false });
    } else {
      d.key = new Date().getTime().toString();
      modelData.value.push(d);
    }
  } else {
    d.key = new Date().getTime().toString();
    modelData.value.push(d);
  }
  createBoxShow.value = false;
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
    <el-table :data="modelData" style="width: 100%" table-layout="auto">
      <el-table-column label="模型">
        <template #default="scope">
          <div style="align-items: center; display: flex">
            <el-avatar
              :size="30"
              :style="{ '--el-avatar-bg-color': scope.row.color }"
            >
              <el-icon v-html="llmsIcons[scope.row.data.mode]" />
            </el-avatar>

            <span style="margin-left: 8px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="data.mode" label="类型" />
      <el-table-column prop="data.url" label="url" />
      <el-table-column label="管理">
        <template #default="scope">
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
        </template>
      </el-table-column>
    </el-table>
    <createLLM
      v-if="createBoxShow"
      v-model="createBoxShow"
      :model="createModelData"
      @create="create"
    ></createLLM>

    <template #footer>
      <div>
        <el-button @click="show = false">取消</el-button>
        <el-button type="primary" @click="newllm">新建</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
