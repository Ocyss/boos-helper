<script lang="ts" setup>
import { useCommon } from '@/hooks/useCommon'
import { useConfFormData } from '@/hooks/useConfForm'

import { useLog } from '@/hooks/useLog'
import { useStatistics } from '@/hooks/useStatistics'
import { delay, notification } from '@/utils'
import { logger } from '@/utils/logger'
import {
  ElButton,
  ElButtonGroup,
  ElCol,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElMessage,
  ElProgress,
  ElRow,
  ElStatistic,
} from 'element-plus'
import { computed, ref } from 'vue'
import { useDeliver } from './hooks/useDeliver'
import { usePager } from './hooks/usePager'

const log = useLog()
const { todayData, statisticsData } = useStatistics()
const { deliverLock, deliverStop } = useCommon()
const { jobListHandle } = useDeliver()
const { next, page } = usePager()
const { formData } = useConfFormData()
const statisticCycle = ref(1)
const statisticCycleData = [
  {
    label: '近三日投递',
    help: '愿你每一次投递都能得到回应',
    date: 3,
  },
  {
    label: '本周投递',
    help: '愿你早日找到心满意足的工作',
    date: 7,
  },
  {
    label: '本月投递',
    help: '愿你在面试中得到满意的结果',
    date: 30,
  },
  {
    label: '历史投递',
    help: '愿你能早九晚五还双休带五险',
    date: -1,
  },
]

const cycle = computed(() => {
  const date = statisticCycleData[statisticCycle.value].date
  let ans = 0
  for (
    let i = 0;
    // eslint-disable-next-line no-unmodified-loop-condition
    (date === -1 || i < date - 1) && i < statisticsData.value.length;
    i++
  ) {
    ans += statisticsData.value[i].success
  }
  return ans
})

const deliveryLimit = computed(() => {
  return formData.deliveryLimit.value
})

async function startBatch() {
  log.reset()
  deliverLock.value = true
  try {
    logger.debug('start batch', page)
    while (page.value.page <= 10 && !deliverStop.value) {
      await delay(formData.delay.deliveryStarts)
      await jobListHandle()
      if (deliverStop.value) {
        break
      }
      await delay(formData.delay.deliveryPageNext)
      next()
    }
  }
  catch (e) {
    logger.error('获取失败', e)
    ElMessage.error(`获取失败! - ${e}`)
  }
  finally {
    logger.debug(log.data)

    if (formData.notification.value) {
      notification('投递结束')
    }
    else {
      ElMessage.info('投递结束')
    }
    deliverLock.value = false
    deliverStop.value = false
  }
}

function stopBatch() {
  deliverStop.value = true
}
</script>

<template>
  <ElRow :gutter="20">
    <ElCol :span="5">
      <ElStatistic
        data-help="统计当天脚本扫描过的所有岗位"
        :value="todayData.total"
        title="岗位总数："
        suffix="份"
      />
    </ElCol>
    <ElCol :span="5">
      <ElStatistic
        data-help="统计当天岗位过滤的比例,被过滤/总数"
        :value="((todayData.total - todayData.success) / todayData.total) * deliveryLimit"
        title="过滤比例："
        suffix="%"
      />
    </ElCol>
    <ElCol :span="5">
      <ElStatistic
        data-help="统计当天岗位中已沟通的比例,已沟通/总数"
        :value="(todayData.repeat / todayData.total) * deliveryLimit"
        title="沟通比例："
        suffix="%"
      />
    </ElCol>
    <ElCol :span="5">
      <ElStatistic
        data-help="统计当天岗位中的活跃情况,不活跃/总数"
        :value="(todayData.activityFilter / todayData.total) * deliveryLimit"
        title="活跃比例："
        suffix="%"
      />
    </ElCol>
    <ElCol :span="4">
      <ElStatistic
        :data-help="statisticCycleData[statisticCycle].help"
        :value="cycle + todayData.success"
        suffix="份"
      >
        <template #title>
          <ElDropdown
            trigger="click"
            @command="
              (arg) => {
                statisticCycle = arg;
              }
            "
          >
            <span class="el-dropdown-link">
              {{ statisticCycleData[statisticCycle].label }}:
              <ElIcon class="el-icon--right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"
                  />
                </svg>
              </ElIcon>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-for="(item, index) in statisticCycleData"
                  :key="index"
                  :command="index"
                >
                  {{ item.label }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
      </ElStatistic>
    </ElCol>
  </ElRow>
  <div style="display: flex">
    <ElButtonGroup style="margin: 10px 30px 0 0">
      <ElButton
        type="primary"
        data-help="点击开始就会开始投递"
        :loading="deliverLock"
        @click="startBatch"
      >
        开始
      </ElButton>
      <ElButton
        v-if="deliverLock && !deliverStop"
        type="warning"
        data-help="暂停后应该能继续"
        @click="stopBatch"
      >
        暂停
      </ElButton>
      <ElButton
        v-if="deliverLock && !deliverStop"
        type="danger"
        data-help="停止后应该不能继续"
        @click="stopBatch"
      >
        停止
      </ElButton>
    </ElButtonGroup>
    <ElProgress
      data-help="我会统计当天脚本投递的数量,该记录并不准确"
      style="flex: 1"
      :percentage="todayData.success / deliveryLimit"
    />
  </div>
</template>

<style lang="scss"></style>
