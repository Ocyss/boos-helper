<script lang="ts" setup>
import formItem from '@/components/form/formItem.vue'
import formSelect from '@/components/form/formSelect.vue'
import { useCommon } from '@/hooks/useCommon'
import { formInfoData, useConfFormData } from '@/hooks/useConfForm'
import {
  ElButton,
  ElCheckbox,
  ElForm,
  ElFormItem,
  ElInput,
} from 'element-plus'

const { formData, confDelete, confExport, confImport, confReload, confSaving }
  = useConfFormData()

const { deliverLock } = useCommon()
</script>

<template>
  <ElForm
    inline
    label-position="left"
    label-width="auto"
    :model="formData"
    :disabled="deliverLock"
  >
    <el-collapse accordion>
      <el-collapse-item title="筛选配置" name="1">
        <el-space wrap style="width: 100%">
          <form-item
            v-bind="formInfoData.company"
            v-model:enable="formData.company.enable"
            v-model:include="formData.company.include"
            :disabled="deliverLock"
          >
            <formSelect
              v-model:value="formData.company.value"
              v-model:options="formData.company.options"
            />
          </form-item>
          <form-item
            v-bind="formInfoData.jobTitle"
            v-model:enable="formData.jobTitle.enable"
            v-model:include="formData.jobTitle.include"
            :disabled="deliverLock"
          >
            <form-select
              v-model:value="formData.jobTitle.value"
              v-model:options="formData.jobTitle.options"
            />
          </form-item>
          <form-item
            v-bind="formInfoData.jobContent"
            v-model:enable="formData.jobContent.enable"
            v-model:include="formData.jobContent.include"
            :disabled="deliverLock"
          >
            <form-select
              v-model:value="formData.jobContent.value"
              v-model:options="formData.jobContent.options"
            />
          </form-item>
          <form-item
            v-bind="formInfoData.hrPosition"
            v-model:enable="formData.hrPosition.enable"
            v-model:include="formData.hrPosition.include"
            :disabled="deliverLock"
          >
            <form-select
              v-model:value="formData.hrPosition.value"
              v-model:options="formData.hrPosition.options"
            />
          </form-item>
          <form-item
            v-bind="formInfoData.salaryRange"
            v-model:enable="formData.salaryRange.enable"
          >
            <ElInput v-model="formData.salaryRange.value" />
          </form-item>
          <form-item
            v-bind="formInfoData.companySizeRange"
            v-model:enable="formData.companySizeRange.enable"
          >
            <ElInput v-model.lazy="formData.companySizeRange.value" />
          </form-item>

          <form-item
            v-bind="formInfoData.customGreeting"
            v-model:enable="formData.customGreeting.enable"
          >
            <ElInput
              v-model.lazy="formData.customGreeting.value"
              type="textarea"
            />
          </form-item>
        </el-space>
        <div>
          <ElCheckbox
            v-bind="formInfoData.activityFilter"
            v-model="formData.activityFilter.value"
            border
          />
          <ElCheckbox
            v-bind="formInfoData.goldHunterFilter"
            v-model="formData.goldHunterFilter.value"
            border
          />
          <ElCheckbox
            v-bind="formInfoData.friendStatus"
            v-model="formData.friendStatus.value"
            border
          />
        </div>
      </el-collapse-item>
      <el-collapse-item title="延迟配置" name="2">
        <ElFormItem
          v-for="(item, key) in formInfoData.delay"
          :key
          :label="item.label"
          :data-help="item.help"
        >
          <el-input-number
            v-model="formData.delay[key]"
            :min="1"
            :max="99999"
            :disabled="item.disable"
          />
        </ElFormItem>
      </el-collapse-item>
    </el-collapse>

    <div style="margin-top: 20px; display: flex">
      <ElCheckbox
        v-bind="formInfoData.greetingVariable"
        v-model="formData.greetingVariable.value"
        border
      />

      <ElCheckbox
        v-bind="formInfoData.notification"
        v-model="formData.notification.value"
        border
      />

      <ElFormItem
        :label="formInfoData.deliveryLimit.label"
        style="margin-left: 30px"
      >
        <el-input-number
          v-bind="formInfoData.deliveryLimit"
          v-model="formData.deliveryLimit.value"
          :min="1"
          :max="1000"
          :step="10"
        />
      </ElFormItem>
    </div>
  </ElForm>
  <div style="margin-top: 15px">
    <ElButton
      type="primary"
      data-help="保存配置，用于后续直接使用当前配置。"
      @click="confSaving"
    >
      保存配置
    </ElButton>
    <ElButton type="primary" data-help="重新加载本地配置" @click="confReload">
      重载配置
    </ElButton>
    <ElButton type="primary" data-help="互联网就是要分享" @click="confExport">
      导出配置
    </ElButton>
    <ElButton type="primary" data-help="互联网就是要分享" @click="confImport">
      导入配置
    </ElButton>
    <ElButton
      type="primary"
      data-help="清空配置,不会帮你保存,可以重载恢复"
      @click="confDelete"
    >
      删除配置
    </ElButton>
  </div>
</template>

<style lang="scss" scoped>
.el-space :deep(.el-space__item) {
  width: 48%;
}
</style>
