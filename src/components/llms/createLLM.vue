<script lang="ts" setup>
import { useConfFormData, formInfoData } from "@/hooks/useConfForm";
import settingsVue from "@/components/icon/settings.vue";
import { computed, ref } from "vue";
import { FormDataAi } from "@/types/formData";
import formSwitch from "@/components/form/formSwitch.vue";
import { useCommon } from "@/hooks/useCommon";
import { modelData, useModel } from "@/hooks/useModel";
import { llms } from "@/hooks/useModel";
import { reactiveComputed } from "@vueuse/core";
import { ElMessage } from "element-plus";
import deepmerge from "@/utils/deepmerge";
import { logger } from "@/utils/logger";
const props = defineProps<{
  model?: modelData;
}>();
const show = defineModel<boolean>({ required: true });
const createName = ref(props.model?.name || "");
const { getGpt } = useModel();
const llmsOptions = computed(() =>
  llms.map((v) => {
    const m = v.mode;
    return { ...m, value: m.mode };
  })
);

const selectLLM = ref(props.model?.data?.mode || llms[0].mode.mode);
const formLLM = computed(() =>
  Math.max(
    llms.findIndex((l) => l.mode.mode === selectLLM.value),
    0
  )
);

type r = Record<string, any>;

function dfs(res: r, data: r) {
  for (const key in data) {
    const v = data[key];
    if ("mode" in v) {
      continue;
    } else if ("alert" in v) {
      res[key] = {};
      dfs(res[key], v.value);
    } else res[key] = v.value;
  }
}

const llmFormData = reactiveComputed<r>(() => {
  const res = {};
  dfs(res, llms[formLLM.value]);
  deepmerge(res, props.model?.data, { clone: false });
  return res;
});

const updateFormLLM = (v: string) => {
  // for (const key in llmFormData) {
  //   delete llmFormData[key];
  // }
  dfs(llmFormData, llms[formLLM.value]);
  deepmerge(llmFormData, props.model?.data, { clone: false });
};
const emit = defineEmits<{ (e: "create", data: modelData): void }>();

async function test() {
  const data: modelData = JSON.parse(
    JSON.stringify(props.model || { name: "", key: "" })
  );
  data.name = createName.value;
  data.data = JSON.parse(JSON.stringify(llmFormData)) as modelData["data"] & {};
  data.data.mode = selectLLM.value;
  logger.debug(data);
  const gpt = getGpt(
    data,
    `你叫做“妙妙”，是一款叫做“妙语笔记”的智能助手，接下来你会分析下面用户的输入：
"""
我的称呼是吴楷鹏，可以叫我大帅哥，出生于香港回归的那一年，生日是 3 月 13 号，喜欢上班
"""
设定：
1. 现在是 2025.10.01 21:21，时区是 Asia/Shanghai
2. 提取昵称、性别、出生日期，剩余全部信息整理成个人介绍
3. 要求输出结构化 JSON 对象，符合下面 TypeScript：
interface UserInfo {
  nickname?: string;
  gender?: 'male'  | 'female';
  dataOfBirth?: string;
  bio?: string;
}
4. 这是例子：const userInfo = {
    "nickname":"董小姐",
    "gender": "female",
    "dateOfBirth":"2001-03-07",
    "bio": "家住在长沙，喜欢做饭"
}

接下来开始分析：const userInfo=`
  );
  const msg = await gpt.message({}, (d) => {
    console.log("gptTest", d);
  });
  console.log("TestRes", msg);
}
function create() {
  const data: modelData = props.model || { name: "", key: "" };
  data.name = createName.value;
  data.data = JSON.parse(JSON.stringify(llmFormData)) as modelData["data"] & {};
  data.data.mode = selectLLM.value;
  emit("create", data);
}
</script>

<template>
  <el-dialog
    v-model="show"
    :title="formInfoData.record.label"
    width="70%"
    align-center
    destroy-on-close
    :z-index="20"
  >
    <el-scrollbar height="60vh" style="padding: 20px">
      <el-form-item label="名称:">
        <el-input v-model="createName" />
      </el-form-item>
      <el-segmented
        v-model="selectLLM"
        :options="llmsOptions"
        block
        @update:modelValue="updateFormLLM"
      >
        <template #default="{ item }">
          <div class="llms-select">
            <el-icon size="20" v-html="item.icon"></el-icon>
            <div>{{ item.label || item.mode }}</div>
          </div>
        </template>
      </el-segmented>
      <el-form label-width="auto" size="large" label-position="left">
        <lForm :data="llms[formLLM]" v-model="llmFormData" />
      </el-form>
    </el-scrollbar>
    <template #footer>
      <div>
        <el-button @click="show = false">取消</el-button>
        <el-button type="info" @click="test">测试</el-button>
        <el-button type="primary" @click="create">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
.llms-select {
  display: flex;
  align-items: center;
  flex-direction: column;
  grid-gap: 0.5rem;
  gap: 0.5rem;
  padding: 0.5rem;
}
</style>
