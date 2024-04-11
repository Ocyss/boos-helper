<script lang="ts" setup>
import { reactive, toRaw } from "vue";
import {
  ElButton,
  ElForm,
  ElInput,
  ElCheckbox,
  ElFormItem,
  ElSelect,
  ElOption,
} from "element-plus";

import { GM_getValue, GM_setValue } from "$";

import { watchThrottled } from "@vueuse/core";

import formItem from "@/components/form/formItem.vue";
import formSelect from "@/components/form/formSelect.vue";
import deepmerge from "@/utils/deepmerge";
import { FormData } from "@/types/formData";
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
      <el-input v-model="formData.salaryRange.value" style="width: 240px" />
    </form-item>
    <form-item
      v-bind="formInfoData.companySizeRange"
      v-model:enable="formData.companySizeRange.enable"
    >
      <el-input
        v-model.lazy="formData.companySizeRange.value"
        style="width: 240px"
      />
    </form-item>

    <form-item
      v-bind="formInfoData.customGreeting"
      v-model:enable="formData.customGreeting.enable"
    >
      <el-input
        v-model.lazy="formData.customGreeting.value"
        style="width: 240px"
      />
    </form-item>
    <el-form-item label="处理动画">
      <el-select
        @v-model="formData.animation"
        clearable
        style="width: 240px"
        placeholder="无动画"
      >
        <el-option label="边框" value="frame" />
        <el-option label="卡片" value="card" />
        <el-option label="一起" value="together" />
      </el-select>
    </el-form-item>
    <div>
      <el-checkbox
        v-bind="formData.greetingVariable"
        v-model="formData.greetingVariable.value"
        border
      />
      <el-checkbox
        v-bind="formData.activityFilter"
        v-model="formData.activityFilter.value"
        border
      />
      <el-checkbox
        v-bind="formData.notification"
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

<style lang="scss" scoped></style>
./hooks/useForm