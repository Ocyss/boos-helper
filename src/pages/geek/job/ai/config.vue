<script lang="ts" setup>
import {
  ElDialog,
  ElButton,
  ElPopconfirm,
  ElInput,
  ElSelectV2,
  ElText,
  ElLink,
  ElAlert,
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
const val = ref(formData[props.data].prompt);
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
      multiple
      style="width: 45%; margin-bottom: 8px"
    />
    <el-text>
      此处使用
      <el-link
        type="primary"
        href="https://www.npmjs.com/package/mitem"
        target="_blank"
      >
        模板引擎 mitem
      </el-link>
      来渲染模板。当配置多个模型的时候将依次调用，使用第一个响应.
    </el-text>

    <el-input
      v-if="typeof val === 'string'"
      v-model="val"
      style="width: 100%"
      :autosize="{ minRows: 10, maxRows: 18 }"
      type="textarea"
      placeholder="如果无内容或错误内容请直接恢复默认，示例会随脚本更新"
    ></el-input>
    <el-alert
      v-if="data === 'aiFiltering'"
      title="自带尾巴"
      type="info"
      :description="`>>>下面是岗位相关信息:
      岗位描述:{{ card.postDescription}}
      薪酬:{{card.salaryDesc}}
      经验要求:{{card.experienceName}},学历要求:{{card.degreeName}}
      相关标签:{{card.jobLabels}},公司福利：{{data.welfareList}}
      >>>>>>>>>>我需要你输出Json格式的字符串，符合以下的定义
      interface aiFiltering {
      rating: number; // 分数，0-100分，低于60的我会筛选掉
      negative: string[] | string; // 扣分项，可以是一句话为什么扣分，也可以是数组代表多个扣分项
      positive: string[] | string; // 加分项，可以是一句话为什么加分，也可以是数组代表多个加分项
      }`"
    />
    <template #footer>
      <div>
        <el-button @click="show = false">取消</el-button>
        <el-popconfirm
          title="恢复默认但不保存～"
          @confirm="val = defaultFormData[data].prompt"
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
              formData[data].prompt = val;
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

<style lang="scss">
.el-alert--info.is-light,
.el-alert--info.is-light .el-alert__description {
  white-space: pre-line;
}
</style>
