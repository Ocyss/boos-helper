<script lang="ts" setup>
import { ElButton, ElButtonGroup, ElSpace } from "element-plus";
import { useFormData } from "./hooks/useForm";
import settingsVue from "@/components/icon/settings.vue";
import { ref } from "vue";
import greetingVue from "./ai/greeting.vue";
import modelVue from "./ai/model.vue";
import { FormDataAi } from "@/types/formData";
const { formData, deliverLock, confSaving } = useFormData();

const aiBoxShow = ref(false);
const aiBox = ref();
function change(v: FormDataAi) {
  v.enable = !v.enable;
  confSaving();
}
</script>

<template>
  <el-space wrap fill :fill-ratio="32" style="width: 100%">
    <el-button-group
      :type="formData.aiGreeting.enable ? 'success' : 'danger'"
      help="即使前面招呼语开了也不会发送，只会发送AI生成的招呼语，让gpt来打招呼真是太棒了，毕竟开场白很重要。"
    >
      <el-button
        :disabled="deliverLock"
        @click="() => change(formData.aiGreeting)"
      >
        AI招呼语
      </el-button>
      <el-button
        :icon="settingsVue"
        @click="
          aiBox = greetingVue;
          aiBoxShow = true;
        "
      />
    </el-button-group>
    <el-button-group
      type="info"
      help="根据工作内容让gpt分析过滤，真是太稳健了，不放过任何一个垃圾"
    >
      <el-button disabled>AI过滤</el-button>
      <el-button disabled :icon="settingsVue" />
    </el-button-group>
    <el-button-group
      type="info"
      help="万一消息太多，回不过来了呢，也许能和AiHR聊到地球爆炸？魔法击败魔法"
    >
      <el-button disabled>AI回复</el-button>
      <el-button disabled :icon="settingsVue" />
    </el-button-group>
  </el-space>
  <div style="margin-top: 15px">
    <el-button
      type="primary"
      help="有那么多功能，当然要分等级了，不然岂不是浪费了这么多的模型（主要缺钱）"
      @click="
        aiBox = modelVue;
        aiBoxShow = true;
      "
    >
      模型配置
    </el-button>
  </div>
  <Teleport to="body">
    <component v-if="aiBox" :is="aiBox" v-model="aiBoxShow" />
  </Teleport>
</template>

<style lang="scss">
.el-space .el-button-group {
  display: flex;
  .el-button:first-child {
    flex: 1;
  }
}
</style>
