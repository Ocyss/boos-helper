<script lang="tsx" setup>
import Alert from '@/components/Alert'
import formItem from '@/components/form/formItem.vue'
import formSelect from '@/components/form/formSelect.vue'
import { useCommon } from '@/composables/useCommon'
import { formInfoData, useConf } from '@/stores/conf'
import { amapGeocode } from '@/utils/amap'
import { ElMessage } from 'element-plus'
import aiVue from './ai.vue'

const conf = useConf()

const { deliverLock } = useCommon()
const amapGeocodeLoading = ref(false)
async function amapGeocodeHandler() {
  amapGeocodeLoading.value = true
  try {
    const res = await amapGeocode(conf.formData.amap.origins)
    if (res) {
      conf.formData.amap.origins = res.location
    }
    else {
      ElMessage.error('获取地址失败')
    }
  }
  catch (error) {
    ElMessage.error('获取地址失败')
    logger.error(error)
  }
  finally {
    amapGeocodeLoading.value = false
  }
}

const SalaryRangeComponent = defineComponent({
  props: {
    value: {
      type: Object as PropType<[number, number, boolean]>,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    step: {
      type: Number,
    },
    width: {
      type: String,
    },
    controls: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const handleToggle = () => {
      // eslint-disable-next-line vue/no-mutating-props
      props.value[2] = !props.value[2]
    }
    return () => (
      <div style="display: flex;flex: 1;justify-content: space-between;align-items: center;">
        <el-input-number
          v-model={props.value[0]}
          style={`width: ${props.width || '105px'};`}
          controls={props.controls}
          controls-position="right"
          min={0}
          step={props.step}
        />
        <span>-</span>
        <el-input-number
          v-model={props.value[1]}
          style={`width: ${props.width || '105px'};`}
          controls={props.controls}
          controls-position="right"
          min={0}
          step={props.step}
        />
        <span>{props.unit}</span>
        {props.show
        && (
          <el-button
            onClick={handleToggle}
            size="small"
          >
            {props.value[2] ? '严格' : '宽松'}
          </el-button>
        )}
      </div>
    )
  },
})
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
  <ElForm inline label-position="left" label-width="auto" :model="conf.formData" :disabled="deliverLock">
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
            v-bind="formInfoData.company" v-model:enable="conf.formData.company.enable"
            v-model:include="conf.formData.company.include" :disabled="deliverLock"
          >
            <formSelect v-model:value="conf.formData.company.value" v-model:options="conf.formData.company.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.jobTitle" v-model:enable="conf.formData.jobTitle.enable"
            v-model:include="conf.formData.jobTitle.include" :disabled="deliverLock"
          >
            <form-select v-model:value="conf.formData.jobTitle.value" v-model:options="conf.formData.jobTitle.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.jobContent" v-model:enable="conf.formData.jobContent.enable"
            v-model:include="conf.formData.jobContent.include" :disabled="deliverLock"
          >
            <form-select v-model:value="conf.formData.jobContent.value" v-model:options="conf.formData.jobContent.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.hrPosition" v-model:enable="conf.formData.hrPosition.enable"
            v-model:include="conf.formData.hrPosition.include" :disabled="deliverLock"
          >
            <form-select v-model:value="conf.formData.hrPosition.value" v-model:options="conf.formData.hrPosition.options" />
          </form-item>
          <form-item
            v-bind="formInfoData.jobAddress" v-model:enable="conf.formData.jobAddress.enable"
            :disabled="deliverLock"
          >
            <template #include>
              <ElLink
                type="primary"
                size="small"
              >
                包含
              </ElLink>
            </template>
            <form-select v-model:value="conf.formData.jobAddress.value" v-model:options="conf.formData.jobAddress.options" />
          </form-item>
          <form-item v-bind="formInfoData.salaryRange" v-model:enable="conf.formData.salaryRange.enable">
            <SalaryRangeComponent :value="conf.formData.salaryRange.value" width="80px" unit="K" :show="false" />
            <el-popover placement="top" :width="400" trigger="click">
              <template #reference>
                <el-button style="margin-left: 5px">
                  高级
                </el-button>
              </template>
              <el-alert title="宽松匹配: 薪资范围有任何重叠即匹配, 如10-20K: 15-20K, 15-21k, 20-26k 都满足, 21-22k 不满足" type="info" show-icon :closable="false" />
              <el-alert title="严格匹配: 目标薪资需完全在职位范围内, 如10-20K: 10-15K 和15-20K 满足, 15-21k 不满足" type="info" show-icon :closable="false" />
              <SalaryRangeComponent :value="conf.formData.salaryRange.value" unit="K" :show="true" />
              <SalaryRangeComponent :value="conf.formData.salaryRange.advancedValue.H" unit="元/时" :show="true" :step="5" />
              <SalaryRangeComponent :value="conf.formData.salaryRange.advancedValue.D" unit="元/天" :show="true" :step="10" />
              <SalaryRangeComponent :value="conf.formData.salaryRange.advancedValue.M" unit="元/月" :show="true" :step="200" />
            </el-popover>
          </form-item>
          <form-item v-bind="formInfoData.companySizeRange" v-model:enable="conf.formData.companySizeRange.enable">
            <SalaryRangeComponent :controls="false" :value="conf.formData.companySizeRange.value" width="90px" unit="人" :show="true" />
          </form-item>

          <form-item v-bind="formInfoData.customGreeting" v-model:enable="conf.formData.customGreeting.enable">
            <ElInput v-model.lazy="conf.formData.customGreeting.value" type="textarea" />
          </form-item>
        </el-space>
        <el-space wrap>
          <ElCheckbox v-bind="formInfoData.greetingVariable" v-model="conf.formData.greetingVariable.value" border />
          <ElCheckbox v-bind="formInfoData.activityFilter" v-model="conf.formData.activityFilter.value" border />
          <ElCheckbox v-bind="formInfoData.goldHunterFilter" v-model="conf.formData.goldHunterFilter.value" border />
          <ElCheckbox v-bind="formInfoData.friendStatus" v-model="conf.formData.friendStatus.value" border />
          <ElCheckbox v-bind="formInfoData.sameCompanyFilter" v-model="conf.formData.sameCompanyFilter.value" border />
          <ElCheckbox v-bind="formInfoData.sameHrFilter" v-model="conf.formData.sameHrFilter.value" border />
        </el-space>
      </el-collapse-item>
      <el-collapse-item title="地址配置" name="4">
        <Alert id="config-amap-1" style="margin-bottom: 10px" show-icon type="info">
          <template #title>
            使用高德地图前 推荐结合工作地址包含使用, 需自行申请key,
            <br>
            <el-link href="https://lbs.amap.com/dev/" target="_blank" type="warning">
              https://lbs.amap.com/dev/
            </el-link>
            每日免费配额足够使用
          </template>
        </Alert>
        <Alert
          id="config-amap-ai" style="margin-bottom: 10px" :closable="false" type="info" description="AI Prompt 参考如下语法(仅筛选可用):
            直线距离: {{ amap.straightDistance }}km
            驾车距离: {{ amap.drivingDistance }}km
            驾车时间: {{ amap.drivingDuration }}分钟
            步行距离: {{ amap.walkingDistance }}km
            步行时间: {{ amap.walkingDuration }}分钟
            "
        />
        <ElCheckbox
          v-bind="formInfoData.amap.enable" v-model="conf.formData.amap.enable" border
          style="margin-right: 10px;"
        />
        <ElFormItem v-bind="formInfoData.amap.key">
          <ElInput v-model.lazy="conf.formData.amap.key" />
        </ElFormItem>
        <br>
        <ElFormItem v-bind="formInfoData.amap.origins">
          <ElInput v-model.lazy="conf.formData.amap.origins" :disabled="amapGeocodeLoading">
            <template #append>
              <ElButton type="primary" :loading="amapGeocodeLoading" @click="amapGeocodeHandler()">
                🤖
              </ElButton>
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem v-bind="formInfoData.amap.straightDistance">
          <ElInputNumber v-model.lazy="conf.formData.amap.straightDistance" :precision="1" :max="1000" :min="0" :step="1">
            <template #suffix>
              <span>km</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <br>
        <ElFormItem v-bind="formInfoData.amap.drivingDistance">
          <ElInputNumber v-model.lazy="conf.formData.amap.drivingDistance" :precision="1" :max="1000" :min="0" :step="1">
            <template #suffix>
              <span>km</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <ElFormItem v-bind="formInfoData.amap.drivingDuration">
          <ElInputNumber v-model.lazy="conf.formData.amap.drivingDuration" :precision="2" :max="1440" :min="0" :step="30">
            <template #suffix>
              <span>分钟</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <br>
        <ElFormItem v-bind="formInfoData.amap.walkingDistance">
          <ElInputNumber v-model.lazy="conf.formData.amap.walkingDistance" :precision="1" :max="1000" :min="0" :step="1">
            <template #suffix>
              <span>km</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
        <ElFormItem v-bind="formInfoData.amap.walkingDuration">
          <ElInputNumber v-model.lazy="conf.formData.amap.walkingDuration" :precision="2" :max="1440" :min="0" :step="30">
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
          <el-input-number v-model="conf.formData.delay[key]" :min="1" :max="99999" :disabled="item.disable" />
        </ElFormItem>
      </el-collapse-item>
    </el-collapse>

    <div style="margin-top: 20px; display: flex">
      <ElCheckbox v-bind="formInfoData.notification" v-model="conf.formData.notification.value" border />

      <ElFormItem :label="formInfoData.deliveryLimit.label" style="margin-left: 30px">
        <el-input-number
          v-bind="formInfoData.deliveryLimit" v-model="conf.formData.deliveryLimit.value" :min="1" :max="1000"
          :step="10"
        />
      </ElFormItem>
    </div>
  </ElForm>
  <div style="margin-top: 15px">
    <ElButton type="primary" data-help="保存配置，用于后续直接使用当前配置。" @click="conf.confSaving">
      保存配置
    </ElButton>
    <ElButton type="primary" data-help="重新加载本地配置" @click="conf.confReload">
      重载配置
    </ElButton>
    <ElButton type="primary" data-help="互联网就是要分享" @click="conf.confExport">
      导出配置
    </ElButton>
    <ElButton type="primary" data-help="互联网就是要分享" @click="conf.confImport">
      导入配置
    </ElButton>
    <ElButton type="primary" data-help="清空配置,不会帮你保存,可以重载恢复" @click="conf.confDelete">
      删除配置
    </ElButton>
  </div>
</template>

<style lang="scss" scoped>
.ehp-space.config-input :deep(.ehp-space__item) {
  width: 48%;
}
</style>
