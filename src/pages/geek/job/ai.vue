<script lang="ts" setup>
import { ElButton, ElButtonGroup, ElSpace } from "element-plus";
import { useConfFormData, formInfoData } from "@/hooks/useConfForm";
import settingsVue from "@/components/icon/settings.vue";
import { ref } from "vue";
import configVue from "./ai/config.vue";
import modelVue from "./ai/model.vue";
import { FormDataAi } from "@/types/formData";
import formAiVue from "@/components/form/formAi.vue";
import { useCommon } from "@/hooks/useCommon";

const { formData, confSaving } = useConfFormData();
const { deliverLock } = useCommon();
const aiBoxShow = ref(false);
const aiConfBoxShow = ref(false);
const aiBox = ref<"aiGreeting" | "aiFiltering" | "aiReply">("aiGreeting");
function change(v: FormDataAi) {
  v.enable = !v.enable;
  confSaving();
}
</script>

<template>
  <el-space wrap fill :fill-ratio="32" style="width: 100%">
    <formAiVue
      v-bind="formInfoData.aiGreeting"
      :data="formData.aiGreeting"
      :lock="deliverLock"
      @show="
        aiBox = 'aiGreeting';
        aiBoxShow = true;
      "
      @change="change"
    />
    <formAiVue
      v-bind="formInfoData.aiFiltering"
      :data="formData.aiFiltering"
      :lock="deliverLock"
      @show="
        aiBox = 'aiFiltering';
        aiBoxShow = true;
      "
      @change="change"
    />
    <formAiVue
      v-bind="formInfoData.aiReply"
      :data="formData.aiReply"
      @show="
        aiBox = 'aiReply';
        aiBoxShow = true;
      "
      @change="change"
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
