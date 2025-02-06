<script lang="ts" setup>
import { computed, ref, toRaw } from "vue";
import {
  ElButton,
  ElButtonGroup,
  ElRow,
  ElCol,
  ElStatistic,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElProgress,
  ElIcon,
  ElMessage,
} from "element-plus";

import { useDeliver } from "./hooks/useDeliver";
import { delay, notification } from "@/utils";
import { useLog } from "@/hooks/useLog";
import { useCommon } from "@/hooks/useCommon";
import { useStatistics } from "@/hooks/useStatistics";
import { useJobList } from "./hooks/useJobList";
import { usePager } from "./hooks/usePager";
import { logger } from "@/utils/logger";
import { useConfFormData } from "@/hooks/useConfForm";

const log = useLog();
const { todayData, statisticsData } = useStatistics();
const { deliverLock, deliverStop } = useCommon();
const { jobListHandle } = useDeliver();
const { jobList, jobMap } = useJobList();
const { next, page, prev } = usePager();
const { formData } = useConfFormData();
const statisticCycle = ref(1);
const statisticCycleData = [
  {
    label: "近三日投递",
    help: "愿你每一次投递都能得到回应",
    date: 3,
  },
  {
    label: "本周投递",
    help: "愿你早日找到心满意足的工作",
    date: 7,
  },
  {
    label: "本月投递",
    help: "愿你在面试中得到满意的结果",
    date: 30,
  },
  {
    label: "历史投递",
    help: "愿你能早九晚五还双休带五险",
    date: -1,
  },
];

const cycle = computed(() => {
  const date = statisticCycleData[statisticCycle.value].date;
  let ans = 0;
  for (
    var i = 0;
    (date == -1 || i < date - 1) && i < statisticsData.length;
    i++
  ) {
    ans += statisticsData[i].success;
  }
  return ans;
});

const deliveryLimit = computed(() => {
  return formData.deliveryLimit.value;
});

async function startBatch() {
  log.reset();
  deliverLock.value = true;
  try {
    logger.debug("start batch", page);
    while (page.value.page <= 10 && !deliverStop.value) {
      await delay(formData.delay.deliveryStarts);
      await jobListHandle(jobList.value, jobMap.actions);
      if (deliverStop.value) {
        break;
      }
      await delay(formData.delay.deliveryPageNext);
      next();
      jobMap.actions.clear();
    }
  } catch (e) {
    logger.error("获取失败", e);
    ElMessage.error(`获取失败! - ${e}`);
  } finally {
    logger.debug(log.data);

    if (formData.notification.value) {
      notification("投递结束");
    } else {
      ElMessage.info("投递结束");
    }
    deliverLock.value = false;
    deliverStop.value = false;
  }
}

function stopBatch() {
  deliverStop.value = true;
}
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="5">
      <el-statistic
        data-help="统计当天脚本扫描过的所有岗位"
        :value="todayData.total"
        title="岗位总数："
        suffix="份"
      ></el-statistic>
    </el-col>
    <el-col :span="5">
      <el-statistic
        data-help="统计当天岗位过滤的比例,被过滤/总数"
        :value="((todayData.total - todayData.success) / todayData.total) * deliveryLimit"
        title="过滤比例："
        suffix="%"
      ></el-statistic>
    </el-col>
    <el-col :span="5">
      <el-statistic
        data-help="统计当天岗位中已沟通的比例,已沟通/总数"
        :value="(todayData.repeat / todayData.total) * deliveryLimit"
        title="沟通比例："
        suffix="%"
      ></el-statistic>
    </el-col>
    <el-col :span="5">
      <el-statistic
        data-help="统计当天岗位中的活跃情况,不活跃/总数"
        :value="(todayData.activityFilter / todayData.total) * deliveryLimit"
        title="活跃比例："
        suffix="%"
      ></el-statistic>
    </el-col>
    <el-col :span="4">
      <el-statistic
        :data-help="statisticCycleData[statisticCycle].help"
        :value="cycle + todayData.success"
        suffix="份"
      >
        <template #title>
          <el-dropdown
            trigger="click"
            @command="
              (arg) => {
                statisticCycle = arg;
              }
            "
          >
            <span class="el-dropdown-link">
              {{ statisticCycleData[statisticCycle].label }}:
              <el-icon class="el-icon--right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"
                  ></path>
                </svg>
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(item, index) in statisticCycleData"
                  :command="index"
                >
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-statistic>
    </el-col>
  </el-row>
  <div style="display: flex">
    <el-button-group style="margin: 10px 30px 0 0">
      <el-button
        type="primary"
        data-help="点击开始就会开始投递"
        :loading="deliverLock"
        @click="startBatch"
      >
        开始
      </el-button>
      <el-button
        v-if="deliverLock && !deliverStop"
        type="warning"
        data-help="暂停后应该能继续"
        @click="stopBatch"
      >
        暂停
      </el-button>
      <el-button
        v-if="deliverLock && !deliverStop"
        type="danger"
        data-help="停止后应该不能继续"
        @click="stopBatch"
      >
        停止
      </el-button>
    </el-button-group>
    <el-progress
      data-help="我会统计当天脚本投递的数量,该记录并不准确"
      style="flex: 1"
      :percentage="todayData.success / deliveryLimit"
    />
  </div>
</template>

<style lang="scss"></style>
