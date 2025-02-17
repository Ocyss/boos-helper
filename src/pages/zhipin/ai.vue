<script lang="ts" setup>
import type { FormDataAi } from '@/types/formData'
import formSwitch from '@/components/form/formSwitch.vue'
import { useCommon } from '@/hooks/useCommon'
import { formInfoData, useConfFormData } from '@/hooks/useConfForm'
import { ElButton, ElSpace } from 'element-plus'
import { ref } from 'vue'

const { formData, confSaving } = useConfFormData()
const { deliverLock } = useCommon()
// const useModelData = useModel()
const aiBoxShow = ref(false)
const aiConfBoxShow = ref(false)
const aiBox = ref<'aiGreeting' | 'aiFiltering' | 'aiReply' | 'record'>(
  'aiGreeting',
)
function change(v: Partial<FormDataAi>) {
  v.enable = !v.enable
  confSaving()
}
// 写的依托
// const m = formData.record.model || []
// const recordModel = ref(Array.isArray(m) ? m : [m])
</script>

<template>
  <ElSpace wrap fill :fill-ratio="32" style="width: 100%">
    <formSwitch
      :label="formInfoData.aiGreeting.label"
      :data-help="formInfoData.aiGreeting['data-help']"
      :data="formData.aiGreeting"
      :lock="deliverLock"
      @show="
        aiBox = 'aiGreeting';
        aiBoxShow = true;
      "
      @change="change"
    />
    <formSwitch
      :label="formInfoData.aiFiltering.label"
      :data-help="formInfoData.aiFiltering['data-help']"
      :data="formData.aiFiltering"
      :lock="deliverLock"
      @show="
        aiBox = 'aiFiltering';
        aiBoxShow = true;
      "
      @change="change"
    />
    <formSwitch
      :label="formInfoData.aiReply.label"
      :data-help="formInfoData.aiReply['data-help']"
      :data="formData.aiReply"
      disabled
      @show="
        aiBox = 'aiReply';
        aiBoxShow = true;
      "
      @change="change"
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
  </ElSpace>
  <div style="margin-top: 15px">
    <ElButton
      type="primary"
      data-help="有那么多功能，当然要分等级了，不然岂不是浪费了这么多的模型（主要缺钱）"
      @click="aiConfBoxShow = true"
    >
      模型配置
    </ElButton>
  </div>

  <configLLM v-model="aiConfBoxShow" />
  <selectLLM
    v-if="aiBoxShow && aiBox !== 'record'"
    v-model="aiBoxShow"
    v-key="aiBox"
    :data="aiBox"
  />
</template>

<style lang="scss">
.el-space .el-button-group {
  display: flex;
  .el-button:first-child {
    flex: 1;
  }
}
</style>
