<script lang="ts" setup>
import { useConfFormData, formInfoData } from "@/hooks/useConfForm";
import settingsVue from "@/components/icon/settings.vue";
import { computed, ref } from "vue";
import { FormDataAi } from "@/types/formData";
import formSwitch from "@/components/form/formSwitch.vue";
import { useCommon } from "@/hooks/useCommon";
import { useModel } from "@/hooks/useModel";
import { llms } from "@/hooks/useModel";

const show = defineModel<boolean>({ required: true });
const { formData, confSaving } = useConfFormData();
const { deliverLock } = useCommon();
const useModelData = useModel();
const aiBoxShow = ref(false);
const aiConfBoxShow = ref(false);
const aiBox = ref<"aiGreeting" | "aiFiltering" | "aiReply" | "record">(
  "aiGreeting"
);

const llmsOptions = computed(() =>
  llms.map((v) => {
    const m = v.mode;
    return { ...m, value: m.mode };
  })
);
const selectLLM = ref(llms[0].mode);

const formLLM = ref(llms[0]);

const updateFormLLM = (v) => {
  formLLM.value = llms.find((l) => l.mode.mode === v) || llms[0];
};

function change(v: Partial<FormDataAi>) {
  v.enable = !v.enable;
  confSaving();
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
        <lForm :data="formLLM" />
      </el-form>
    </el-scrollbar>
    <template #footer>
      <div>
        <el-button @click="aiBoxShow = false">取消</el-button>
        <el-button type="primary">新建</el-button>
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
