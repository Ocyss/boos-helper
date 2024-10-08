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
import { FormDataAi, FormData, FormInfoAi } from "@/types/formData";
import { prompt } from "@/hooks/useModel/type";
const { formData, confSaving, defaultFormData } = useConfFormData();
const { modelData } = useModel();
const props = defineProps<{
  data: "aiGreeting" | "aiFiltering" | "aiReply";
}>();

const show = defineModel<boolean>({ required: true });
const model = ref(formData[props.data].model);
const singleMode = ref(!Array.isArray(formData[props.data].prompt));
const role = ["system", "user", "assistant"].map((item) => {
  return {
    label: item,
    value: item,
  };
});

let _message = formData[props.data].prompt;

if (Array.isArray(_message)) {
  _message = [..._message].map((item) => ({ ...item }));
}

const message = ref<string | prompt>(_message);

function inputExample() {
  message.value = (formInfoData[props.data] as FormInfoAi).example[
    singleMode.value ? 0 : 1
  ];
}
function changeMode(v: boolean | string | number | undefined) {
  if (v) {
    message.value = "";
  } else {
    message.value = [
      { role: "user", content: "" },
      { role: "assistant", content: "" },
      { role: "user", content: "" },
    ];
  }
}

function removeMessage(item: prompt[number]) {
  if (Array.isArray(message.value)) {
    message.value = message.value.filter((v) => v !== item);
  }
}

function addMessage() {
  if (Array.isArray(message.value)) {
    message.value.push({ role: "user", content: "" });
  }
}
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
    <el-alert
      title="对于性能强的模型使用单对话在够用的同时也能减少tokens的使用。而性能稍弱的模型使用多对话来加强引导,但也会消耗更多的tokens"
      type="info"
      :closable="false"
    />
    <div class="select-form-box">
      <el-radio-group
        v-model="singleMode"
        size="large"
        @update:modelValue="changeMode"
      >
        <el-radio-button label="单对话模式" :value="true" />
        <el-radio-button label="多对话模式" :value="false" />
      </el-radio-group>
      <el-button @click="inputExample">填入示例值</el-button>
      <el-select-v2
        v-model="model"
        :options="modelData"
        :props="{ label: 'name', value: 'key' }"
        placeholder="选择模型"
        style="width: 35%"
      />
    </div>

    <el-text style="margin: 20px 0" tag="div">
      使用
      <el-link
        type="primary"
        href="https://ygorko.github.io/mitem/"
        target="_blank"
      >
        mitem
      </el-link>
      来渲染模板。在多对话模式下，只有最后的消息会使用模板。
      <el-link type="primary" href="#" target="_blank">变量表</el-link>
      <br />
      推荐阅读
      <el-link
        type="primary"
        href="https://langgptai.feishu.cn/wiki/RXdbwRyASiShtDky381ciwFEnpe"
        target="_blank"
      >
        《LangGPT》
      </el-link>
      的提示词文档学习 ( 示例提示词写的并不好,欢迎AI大佬来提pr )
    </el-text>

    <el-input
      v-if="singleMode"
      v-model="message as string"
      style="width: 100%"
      :autosize="{ minRows: 10, maxRows: 18 }"
      type="textarea"
    />
    <el-form
      v-else
      v-model="message as string"
      label-width="auto"
      class="demo-dynamic"
    >
      <el-form-item v-for="(item, index) in (message as prompt)" :key="index">
        <template #label>
          <el-select-v2
            v-model="item.role"
            :options="role"
            style="width: 140px"
          />
        </template>
        <div
          class="select-form-box"
          style="width: 100%; align-items: flex-start"
        >
          <el-input
            v-model="item.content"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 8 }"
          />
          <el-button
            style="margin-left: 10px"
            @click.prevent="removeMessage(item)"
          >
            删除
          </el-button>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="addMessage">添加消息</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="show = false">取消</el-button>

        <el-button
          type="primary"
          @click="
            () => {
              formData[data].model = model;
              formData[data].prompt = message;
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
.select-form-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
