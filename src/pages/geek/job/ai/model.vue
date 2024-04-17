<script lang="ts" setup>
import {
  ElDialog,
  ElButton,
  ElTableColumn,
  ElTable,
  ElMessage,
  ElFormItem,
  ElInput,
  ElRadioGroup,
  ElRadioButton,
  ElForm,
  ElSlider,
  ElAlert,
  ElSelect,
  ElOption,
} from "element-plus";
import { ref, toRaw } from "vue";
import deepmerge from "@/utils/deepmerge";
import { useModel, type modelData } from "@/hooks/useModel";
const show = defineModel<boolean>({ required: true });
const { modelData, save } = useModel();
let createData = ref<modelData>({
  key: "",
  name: "",
  mode: "openai",
  data: undefined,
});

const createBoxShow = ref(false);

function create() {
  createData.value = {
    key: "",
    name: "",
    default: false,
    data: {
      mode: "ChatGPT",
      url: "",
      model: "gpt-3.5-turbo",
      apiKey: "",
      temperature: 0.35,
    },
  };
  createBoxShow.value = true;
}
function saveModel() {
  const d = toRaw(createData.value);
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
function changeMode(mode: string) {
  switch (mode) {
    case "ChatGPT":
      deepmerge(
        createData.value.data,
        {
          mode,
          url: "",
          model: "gpt-3.5-turbo",
          apiKey: "",
        },
        { clone: false }
      );
      break;
    case "自定义":
    case "仅记录":
      deepmerge(
        createData.value.data,
        {
          mode,
          url: "",
          header: "",
          data: "",
        },
        { clone: false }
      );
      break;
  }
}
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
function edit(d: modelData) {
  createData.value = toRaw(d);
  createBoxShow.value = true;
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
      <el-table-column prop="name" label="名称" />
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
    <el-dialog
      v-model="createBoxShow"
      width="70%"
      title="新建模型"
      append-to-body
    >
      <el-form label-width="auto" label-position="top">
        <el-form-item label="名称:">
          <el-input v-model="createData.name" />
        </el-form-item>
        <el-form-item label="类别:">
          <el-radio-group
            :model-value="createData.data.mode"
            size="large"
            @update:model-value="changeMode as never"
          >
            <el-radio-button label="ChatGPT" value="ChatGPT" />
            <el-radio-button label="自定义" value="自定义" />
            <el-radio-button label="仅记录" value="仅记录" />
          </el-radio-group>
        </el-form-item>
        <div v-if="createData.data.mode === 'ChatGPT'">
          <el-form-item label="host:">
            <el-input
              v-model="createData.data.url"
              placeholder="https://api.openai.com"
            />
          </el-form-item>
          <el-form-item label="model:">
            <el-input v-model="createData.data.model" />
          </el-form-item>
          <el-form-item label="apiKey:">
            <el-input v-model="createData.data.apiKey" />
          </el-form-item>
          <el-alert title="高级配置，不懂勿改" type="warning" show-icon />
          <el-form-item label="temperature:">
            <el-slider
              v-model="createData.data.temperature"
              :min="0"
              :max="1"
              :step="0.01"
              show-input
              :marks="{ [0.2]: '严谨', [0.8]: '想象' }"
            />
          </el-form-item>
        </div>
        <div
          v-else-if="
            createData.data.mode === '自定义' ||
            createData.data.mode === '仅记录'
          "
        >
          <el-form-item label="请求方式:">
            <el-select model-value="post" disabled style="width: 240px">
              <el-option label="POST" value="post" />
            </el-select>
          </el-form-item>

          <el-form-item label="url:">
            <el-input
              v-model="createData.data.url"
              placeholder="请输入请求地址"
            />
          </el-form-item>
          <el-form-item label="header:">
            <el-input
              autosize
              type="textarea"
              v-model="createData.data.header"
              placeholder="使用Json格式"
            />
          </el-form-item>
          <el-alert
            title="Json格式，其中{{message}}为发给GPT的消息,需要引号包裹，{{raw}}为原始数据，不需要引号包裹通常作为json值对象，在记录模式下很使用"
            type="info"
            show-icon
          />
          <el-form-item label="data:">
            <el-input autosize type="textarea" v-model="createData.data.data" />
          </el-form-item>
          <div v-if="createData.data.mode === '自定义'">
            <el-alert
              title="响应内容提取，返回体将作为模板引擎的数据传入，数据一般在data.data，最终产物将作为gpt响应发给boos或筛选判断。（发送给Boos需要字符串，筛选需要json格式）"
              type="info"
              show-icon
            />
            <el-form-item label="req:">
              <el-input
                v-model="createData.data.req"
                placeholder="示例：data.message[0]"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div>
          <el-button @click="createBoxShow = false">取消</el-button>

          <el-button type="primary" @click="saveModel">
            {{ createData.key ? "保存" : "创建" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    <template #footer>
      <div>
        <el-button @click="show = false">取消</el-button>
        <el-button type="primary" @click="create">新建</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
