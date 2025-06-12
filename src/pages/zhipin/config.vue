<script lang="ts" setup>
import Alert from '@/components/Alert'
import formItem from '@/components/form/formItem.vue'
import formSelect from '@/components/form/formSelect.vue'
import { useCommon } from '@/hooks/useCommon'
import { formInfoData, useConfFormData } from '@/hooks/useConfForm'
import { amapGeocode } from '@/utils/amap'
import aiVue from './ai.vue'
import { ElMessage } from 'element-plus'

const { formData, confDelete, confExport, confImport, confReload, confSaving }
  = useConfFormData()

const { deliverLock } = useCommon()
const amapGeocodeLoading = ref(false)
async function amapGeocodeHandler() {
  amapGeocodeLoading.value = true
  try{
    const res = await amapGeocode(formData.amap.origins)
    if (res) {
      formData.amap.origins = res.location
    }else{
      ElMessage.error('获取地址失败')
    }
  } catch (error) {
    ElMessage.error('获取地址失败')
    logger.error(error)
  } finally {
    amapGeocodeLoading.value = false
  }
}
</script>

<template>
  <Alert
    id="config-alert-1" style="margin-bottom: 10px" show-icon title="进行配置前都请先阅读完整的帮助文档，再进行配置，如有bug请反馈"
    type="success"
    description="滚动到底部，差不多150个岗位左右，也会自动停止, 刷新或者变更期望重新获取新的岗位即可。"
  />
  <Alert id="config-alert-2" style="margin-bottom: 10px" type="success" show-icon>
    <template #title>
      使用自定义招呼语前 推荐禁用boss直聘自带招呼语
      <el-link href="https://www.zhipin.com/web/geek/notify-set?type=greetSet" target="_blank" type="warning">
        点我前往设置
      </el-link>
    </template>
  </Alert>
  <ElForm inline label-position="left" label-width="auto" :model="formData" :disabled="deliverLock">
    <el-collapse accordion>
      <el-collapse-item title="筛选配置" name="1">
        <Alert
          id="filter-config-alert-enable" title="复选框打钩才会启用，别忘记打钩启用哦" type="success" show-icon
          style="margin: 10px 0;"
        />
        <Alert
          id="filter-config-alert-mode" title="排除和包含可点击切换，混合模式适用性过低不会考虑开发" type="success" show-icon
          style="margin: 10px 0;"
        />

        <el-space class="config-input" wrap style="width: 100%">
          <form-item
            v-bind="formInfoData.company" v-model:enable="formData.company.enable"
            v-model:include="formData.company.include" :disabled="deliverLock"
          >
            <formSelect v-model:value="formData.company.value" v-model:options="formData.company.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.jobTitle" v-model:enable="formData.jobTitle.enable"
            v-model:include="formData.jobTitle.include" :disabled="deliverLock"
          >
            <form-select v-model:value="formData.jobTitle.value" v-model:options="formData.jobTitle.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.jobContent" v-model:enable="formData.jobContent.enable"
            v-model:include="formData.jobContent.include" :disabled="deliverLock"
          >
            <form-select v-model:value="formData.jobContent.value" v-model:options="formData.jobContent.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.hrPosition" v-model:enable="formData.hrPosition.enable"
            v-model:include="formData.hrPosition.include" :disabled="deliverLock"
          >
            <form-select v-model:value="formData.hrPosition.value" v-model:options="formData.hrPosition.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.jobAddress" v-model:enable="formData.jobAddress.enable" :include-only="true"
            :disabled="deliverLock"
          >
            <form-select v-model:value="formData.jobAddress.value" v-model:options="formData.jobAddress.options" />
          </form-item>
          <form-item v-bind="formInfoData.salaryRange" v-model:enable="formData.salaryRange.enable">
            <ElInput v-model="formData.salaryRange.value" />
          </form-item>
          <form-item v-bind="formInfoData.companySizeRange" v-model:enable="formData.companySizeRange.enable">
            <ElInput v-model.lazy="formData.companySizeRange.value" />
          </form-item>

          <form-item v-bind="formInfoData.customGreeting" v-model:enable="formData.customGreeting.enable">
            <ElInput v-model.lazy="formData.customGreeting.value" type="textarea" />
          </form-item>
        </el-space>
        <el-space wrap>
          <ElCheckbox v-bind="formInfoData.greetingVariable" v-model="formData.greetingVariable.value" border />
          <ElCheckbox v-bind="formInfoData.activityFilter" v-model="formData.activityFilter.value" border />
          <ElCheckbox v-bind="formInfoData.goldHunterFilter" v-model="formData.goldHunterFilter.value" border />
          <ElCheckbox v-bind="formInfoData.friendStatus" v-model="formData.friendStatus.value" border />
          <ElCheckbox v-bind="formInfoData.sameCompanyFilter" v-model="formData.sameCompanyFilter.value" border />
          <ElCheckbox v-bind="formInfoData.sameHrFilter" v-model="formData.sameHrFilter.value" border />
        </el-space>
      </el-collapse-item>
      <el-collapse-item title="地址配置" name="4">
        <Alert id="config-amap-1" style="margin-bottom: 10px" show-icon type="info">
          <template #title >
            使用高德地图前 推荐结合工作地址包含使用, 需自行申请key,
            <br>
            <el-link href="https://lbs.amap.com/dev/" target="_blank" type="warning">
              https://lbs.amap.com/dev/
            </el-link>
            每日免费配额足够使用
          </template>
        </Alert>
        <Alert id="config-amap-ai" style="margin-bottom: 10px" :closable="false" type="info" :description="`AI Prompt 参考如下语法(仅筛选可用):
            直线距离: {{ amap.straightDistance }}km
            驾车距离: {{ amap.drivingDistance }}km
            驾车时间: {{ amap.drivingDuration }}分钟
            步行距离: {{ amap.walkingDistance }}km
            步行时间: {{ amap.walkingDuration }}分钟
            `">
        </Alert>
        <ElCheckbox
          v-bind="formInfoData.amap.enable" v-model="formData.amap.enable" border
          style="margin-right: 10px;"
        />
        <ElFormItem v-bind="formInfoData.amap.key">
          <ElInput v-model.lazy="formData.amap.key" />
        </ElFormItem>
        <br>
        <ElFormItem v-bind="formInfoData.amap.origins">
          <ElInput v-model.lazy="formData.amap.origins" :disabled="amapGeocodeLoading" >
            <template #append>
              <ElButton type="primary" :loading="amapGeocodeLoading"  @click="amapGeocodeHandler()" >
                🤖
              </ElButton>
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem v-bind="formInfoData.amap.straightDistance">
          <ElInputNumber v-model.lazy="formData.amap.straightDistance" :precision="1" :max="1000" :min="0" :step="1">
            <template #suffix>
              <span>km</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <br>
        <ElFormItem v-bind="formInfoData.amap.drivingDistance">
          <ElInputNumber v-model.lazy="formData.amap.drivingDistance" :precision="1" :max="1000" :min="0" :step="1">
            <template #suffix>
              <span>km</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <ElFormItem v-bind="formInfoData.amap.drivingDuration">
          <ElInputNumber v-model.lazy="formData.amap.drivingDuration" :precision="2" :max="1440" :min="0" :step="30">
            <template #suffix>
              <span>分钟</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <br>
        <ElFormItem v-bind="formInfoData.amap.walkingDistance">
          <ElInputNumber v-model.lazy="formData.amap.walkingDistance" :precision="1" :max="1000" :min="0" :step="1">
            <template #suffix>
              <span>km</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <ElFormItem v-bind="formInfoData.amap.walkingDuration">
          <ElInputNumber v-model.lazy="formData.amap.walkingDuration" :precision="2" :max="1440" :min="0" :step="30">
            <template #suffix>
              <span>分钟</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
      </el-collapse-item>
      <el-collapse-item title="AI配置" name="2">
        <aiVue />
      </el-collapse-item>
      <el-collapse-item title="延迟配置" name="3">
        <ElFormItem v-for="(item, key) in formInfoData.delay" :key :label="item.label" :data-help="item['data-help']">
          <el-input-number v-model="formData.delay[key]" :min="1" :max="99999" :disabled="item.disable" />
        </ElFormItem>
      </el-collapse-item>
    </el-collapse>

    <div style="margin-top: 20px; display: flex">
      <ElCheckbox v-bind="formInfoData.notification" v-model="formData.notification.value" border />

      <ElFormItem :label="formInfoData.deliveryLimit.label" style="margin-left: 30px">
        <el-input-number
          v-bind="formInfoData.deliveryLimit" v-model="formData.deliveryLimit.value" :min="1" :max="1000"
          :step="10"
        />
      </ElFormItem>
    </div>
  </ElForm>
  <div style="margin-top: 15px">
    <ElButton type="primary" data-help="保存配置，用于后续直接使用当前配置。" @click="confSaving">
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
    <ElButton type="primary" data-help="清空配置,不会帮你保存,可以重载恢复" @click="confDelete">
      删除配置
    </ElButton>
  </div>
</template>

<style lang="scss" scoped>
.ehp-space.config-input :deep(.ehp-space__item) {
  width: 48%;
}
</style>
