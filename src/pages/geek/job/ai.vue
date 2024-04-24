<script lang="ts" setup>
import { ElButton, ElSpace, ElDialog, ElSelectV2, ElAlert } from "element-plus";
import { useConfFormData, formInfoData } from "@/hooks/useConfForm";
import { ref } from "vue";
import { FormDataAi } from "@/types/formData";
import formSwitch from "@/components/form/formSwitch.vue";
import { useCommon } from "@/hooks/useCommon";
import { useModel } from "@/hooks/useModel";

const { formData, confSaving } = useConfFormData();
const { deliverLock } = useCommon();
const useModelData = useModel();
const aiBoxShow = ref(false);
const aiConfBoxShow = ref(false);
const aiBox = ref<"aiGreeting" | "aiFiltering" | "aiReply" | "record">(
  "aiGreeting"
);
function change(v: Partial<FormDataAi>) {
  v.enable = !v.enable;
  confSaving();
}
// 写的依托
const m = formData.record.model || [];
const recordModel = ref(Array.isArray(m) ? m : [m]);
</script>

<template>
  <el-space wrap fill :fill-ratio="32" style="width: 100%">
    <formSwitch
      v-bind="formInfoData.aiGreeting"
      :data="formData.aiGreeting"
      :lock="deliverLock"
      @show="
        aiBox = 'aiGreeting';
        aiBoxShow = true;
      "
      @change="change"
    />
    <formSwitch
      v-bind="formInfoData.aiFiltering"
      :data="formData.aiFiltering"
      :lock="deliverLock"
      @show="
        aiBox = 'aiFiltering';
        aiBoxShow = true;
      "
      @change="change"
    />
    <formSwitch
      v-bind="formInfoData.aiReply"
      :data="formData.aiReply"
      @show="
        aiBox = 'aiReply';
        aiBoxShow = true;
      "
      @change="change"
      disabled
    />
    <!-- <formSwitch
      v-bind="formInfoData.record"
      :data="formData.record"
      @show="
        aiBox = 'record';
        aiBoxShow = true;
      "
      @change="change"
    /> -->
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

  <configLLM v-model="aiConfBoxShow" />
  <selectLLM
    v-if="aiBoxShow && aiBox !== 'record'"
    v-key="aiBox"
    :data="aiBox"
    v-model="aiBoxShow"
  ></selectLLM>
</template>

<style lang="scss">
.el-space .el-button-group {
  display: flex;
  .el-button:first-child {
    flex: 1;
  }
}
</style>
