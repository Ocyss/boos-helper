<script lang="ts" setup>
import { ElButton, ElSpace, ElDialog, ElSelectV2, ElAlert } from "element-plus";
import { useConfFormData, formInfoData } from "@/hooks/useConfForm";
import settingsVue from "@/components/icon/settings.vue";
import { ref } from "vue";
import configVue from "./ai/config.vue";
import modelVue from "./ai/model.vue";
import { FormDataAi } from "@/types/formData";
import formAiVue from "@/components/form/formAi.vue";
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
    <!-- <formAiVue
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
  <Teleport to="body">
    <modelVue v-model="aiConfBoxShow" />
    <configVue
      v-if="aiBoxShow && aiBox !== 'record'"
      v-key="aiBox"
      :data="aiBox"
      v-model="aiBoxShow"
    />
    <!-- <el-dialog
      v-if="aiBoxShow && aiBox === 'record'"
      v-model="aiBoxShow"
      :title="formInfoData.record.label"
      width="70%"
      align-center
      destroy-on-close
      :z-index="20"
    >
      <el-select-v2
        v-model="recordModel"
        :options="modelData"
        :props="{ label: 'name', value: 'key' }"
        placeholder="选择模型"
        multiple
        style="width: 45%; margin-bottom: 8px"
      />
      <el-alert
        title="数据是宝贵的，每一次投递完都会去请求一次，不要问为什么在AI类别里面为啥是AI同款模型"
        type="warning"
        show-icon
        :closable="false"
      />
      <template #footer>
        <div>
          <el-button @click="aiBoxShow = false">取消</el-button>

          <el-button
            type="primary"
            @click="
              () => {
                formData.record.model = recordModel;
                confSaving();
                aiBoxShow = false;
              }
            "
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog> -->
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
