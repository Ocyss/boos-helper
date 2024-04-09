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
import { useModel } from "@/hooks/useModel";
import { useConfFormData, formInfoData } from "@/hooks/useConfForm";
import { onMounted, ref } from "vue";
import { FormDataAi, FormData } from "@/types/formData";
const { formData, confSaving, defaultFormData } = useConfFormData();
const { modelData } = useModel();
const props = defineProps<{
  data: "aiGreeting" | "aiFiltering" | "aiReply";
}>();
const show = defineModel<boolean>({ required: true });
const val = ref(formData[props.data].word);
const model = ref(formData[props.data].model);
</script>

<template>
  <el-dialog
    v-model="show"
    :title="formInfoData[data].label"
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
      placeholder="如果无内容或错误内容请直接恢复默认，示例会随脚本更新"
    />
    <template #footer>
      <div>
        <el-button @click="show = false">取消</el-button>
        <el-popconfirm
          title="恢复默认但不保存～"
          @confirm="val = defaultFormData[data].word"
        >
          <template #reference>
            <el-button type="info">默认</el-button>
          </template>
        </el-popconfirm>
        <el-button
          type="primary"
          @click="
            () => {
              formData[data].model = model;
              formData[data].word = val;
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
