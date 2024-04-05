<script lang="ts" setup>
import { ElButton, ElButtonGroup, ElSpace } from "element-plus";
import { useFormData, formInfoData } from "./hooks/useForm";
import settingsVue from "@/components/icon/settings.vue";
import { ref } from "vue";
import configVue from "./ai/config.vue";
import modelVue from "./ai/model.vue";
import { FormDataAi } from "@/types/formData";
import formAiVue from "@/components/form/formAi.vue";
const { formData, deliverLock, confSaving } = useFormData();

const aiBoxShow = ref(false);
const aiConfBoxShow = ref(false);
const aiBox = ref<"aiGreeting" | "aiFiltering" | "aiReply">("aiGreeting");
</script>

<template>
  <el-space wrap fill :fill-ratio="32" style="width: 100%">
    <formAiVue
      v-bind="formInfoData.aiGreeting"
      :data="formData.aiGreeting"
      @show="
        aiBox = 'aiGreeting';
        aiBoxShow = true;
      "
    />
    <formAiVue
      v-bind="formInfoData.aiFiltering"
      :data="formData.aiFiltering"
      @show="
        aiBox = 'aiFiltering';
        aiBoxShow = true;
      "
    />
    <formAiVue
      v-bind="formInfoData.aiReply"
      :data="formData.aiReply"
      @show="
        aiBox = 'aiReply';
        aiBoxShow = true;
      "
      disabled
    />
  </el-space>
  <div style="margin-top: 15px">
    <el-button
      type="primary"
      help="有那么多功能，当然要分等级了，不然岂不是浪费了这么多的模型（主要缺钱）"
      @click="aiConfBoxShow = true"
    >
      模型配置
    </el-button>
  </div>
  <Teleport to="body">
    <modelVue v-model="aiConfBoxShow" />
    <configVue
      v-if="aiBoxShow"
      v-key="aiBox"
      :data="aiBox"
      v-model="aiBoxShow"
    />
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
