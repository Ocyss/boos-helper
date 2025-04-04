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
import aiVue from './ai.vue'

const { formData, confDelete, confExport, confImport, confReload, confSaving }
  = useConfFormData()

const { deliverLock } = useCommon()
</script>

<template>
  <ElAlert style="margin-bottom: 10px" show-icon title="进行配置前都请先阅读完整的帮助文档，再进行配置，如有bug请反馈" type="success" />
  <ElAlert style="margin-bottom: 10px" type="success" show-icon>
    <template #title>
      使用自定义招呼语前 推荐禁用boss直聘自带招呼语
      <el-link href="https://www.zhipin.com/web/geek/notify-set?type=greetSet" target="_blank" type="warning">
        点我前往设置
      </el-link>
    </template>
  </ElAlert>
  <ElForm
    inline
    label-position="left"
    label-width="auto"
    :model="formData"
    :disabled="deliverLock"
  >
    <el-collapse accordion>
      <el-collapse-item title="筛选配置" name="1">
        <el-alert title="复选框打钩才会启用，别忘记打钩启用哦" type="success" show-icon style="margin: 10px 0;" />
        <el-alert title="排除和包含可点击切换，混合模式适用性过低不会考虑开发" type="success" show-icon style="margin: 10px 0;" />

        <el-space class="config-input" wrap style="width: 100%">
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
        <el-space wrap>
          <ElCheckbox
            v-bind="formInfoData.greetingVariable"
            v-model="formData.greetingVariable.value"
            border
          />
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
          <ElCheckbox
            v-bind="formInfoData.sameCompanyFilter"
            v-model="formData.sameCompanyFilter.value"
            border
          />
          <ElCheckbox
            v-bind="formInfoData.sameHrFilter"
            v-model="formData.sameHrFilter.value"
            border
          />
        </el-space>
      </el-collapse-item>
      <el-collapse-item title="AI配置" name="2">
        <aiVue />
      </el-collapse-item>
      <el-collapse-item title="延迟配置" name="3">
        <ElFormItem
          v-for="(item, key) in formInfoData.delay"
          :key
          :label="item.label"
          :data-help="item['data-help']"
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
.el-space.config-input :deep(.el-space__item) {
  width: 48%;
}
</style>
