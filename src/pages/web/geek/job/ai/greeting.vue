<script lang="ts" setup>
import {
  ElDialog,
  ElButton,
  ElPopconfirm,
  ElInput,
  ElSelectV2,
  ElText,
  ElLink,
} from "element-plus";
import { useModel } from "../hooks/useModel";
import { useFormData } from "../hooks/useForm";
import { ref } from "vue";
const { formData, confSaving, defaultFormData } = useFormData();
const { modelData } = useModel();
const show = defineModel<boolean>({ required: true });
const val = ref(formData.aiGreeting.word);
const model = ref(formData.aiGreeting.model);
</script>

<template>
  <el-dialog
    v-model="show"
    title="Ai招呼语配置"
    width="70%"
    align-center
    destroy-on-close
    :z-index="20"
  >
    <el-select-v2
      v-model="model"
      :options="modelData"
      :props="{ label: 'name', value: 'key' }"
      placeholder="选择模型"
      style="width: 45%; margin-bottom: 8px"
    />
    <el-text>
      此处使用
      <el-link
        type="primary"
        href="https://www.npmjs.com/package/mitem"
        target="_blank"
      >
        迷你的模板引擎 mitem
      </el-link>
      来渲染模板
    </el-text>

    <el-input
      v-model="val"
      style="width: 100%"
      :autosize="{ minRows: 10, maxRows: 18 }"
      type="textarea"
      placeholder="Please input"
    />
    <template #footer>
      <div>
        <el-button @click="show = false">取消</el-button>
        <el-popconfirm
          title="恢复默认但不保存～"
          @confirm="val = defaultFormData.aiGreeting.word"
        >
          <template #reference>
            <el-button type="info">默认</el-button>
          </template>
        </el-popconfirm>
        <el-button
          type="primary"
          @click="
            () => {
              formData.aiGreeting.model = model;
              formData.aiGreeting.word = val;
              confSaving();
              show = false;
            }
          "
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
