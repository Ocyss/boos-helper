<script lang="ts" setup>
import {
  ElButton,
  ElForm,
  ElInput,
  ElCheckbox,
  ElFormItem,
  ElSelect,
  ElOption,
} from "element-plus";
import formItem from "@/components/form/formItem.vue";
import formSelect from "@/components/form/formSelect.vue";
import { useConfFormData, formInfoData } from "@/hooks/useConfForm";
import { useCommon } from "@/hooks/useCommon";

const { formData, confDelete, confExport, confImport, confReload, confSaving } =
  useConfFormData();

const { deliverLock } = useCommon();
</script>

<template>
  <el-form
    ref="formRef"
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
            v-bind="formInfoData.salaryRange"
            v-model:enable="formData.salaryRange.enable"
          >
            <el-input v-model="formData.salaryRange.value" />
          </form-item>
          <form-item
            v-bind="formInfoData.companySizeRange"
            v-model:enable="formData.companySizeRange.enable"
          >
            <el-input v-model.lazy="formData.companySizeRange.value" />
          </form-item>

          <form-item
            v-bind="formInfoData.customGreeting"
            v-model:enable="formData.customGreeting.enable"
          >
            <el-input
              type="textarea"
              v-model.lazy="formData.customGreeting.value"
            />
          </form-item>
        </el-space>
        <div>
          <el-checkbox
            v-bind="formInfoData.activityFilter"
            v-model="formData.activityFilter.value"
            border
          />
          <el-checkbox
            v-bind="formInfoData.goldHunterFilter"
            v-model="formData.goldHunterFilter.value"
            border
          />
          <el-checkbox
            v-bind="formInfoData.friendStatus"
            v-model="formData.friendStatus.value"
            border
          />
        </div>
      </el-collapse-item>
      <el-collapse-item title="延迟配置" name="2">
        <el-form-item
          v-for="(item, key) in formInfoData.delay"
          :key
          :label="item.label"
          :help="item.help"
        >
          <el-input-number
            v-model="formData.delay[key]"
            :min="1"
            :max="99999"
            :disabled="item.disable"
          />
        </el-form-item>
      </el-collapse-item>
    </el-collapse>

    <div style="margin-top: 20px">
      <el-checkbox
        v-bind="formInfoData.greetingVariable"
        v-model="formData.greetingVariable.value"
        border
      />

      <el-checkbox
        v-bind="formInfoData.notification"
        v-model="formData.notification.value"
        border
      />
    </div>
  </el-form>
  <div style="margin-top: 15px">
    <el-button
      type="primary"
      help="保存配置，用于后续直接使用当前配置。"
      @click="confSaving"
    >
      保存配置
    </el-button>
    <el-button type="primary" help="重新加载本地配置" @click="confReload">
      重载配置
    </el-button>
    <el-button type="primary" help="互联网就是要分享" @click="confExport">
      导出配置
    </el-button>
    <el-button type="primary" help="互联网就是要分享" @click="confImport">
      导入配置
    </el-button>
    <el-button
      type="primary"
      help="清空配置,不会帮你保存,可以重载恢复"
      @click="confDelete"
    >
      删除配置
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.el-space :deep(.el-space__item) {
  width: 48%;
}
</style>
