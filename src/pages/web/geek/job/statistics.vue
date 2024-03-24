<script lang="ts" setup>
import { ref, toRaw } from "vue";
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
} from "element-plus";
import { findAllEl, findEl } from "@/utils/element";
import { useFormData } from "./hooks/form";
import { useDeliver } from "./hooks/deliver";
import { delay } from "@/utils";
import axios from "axios";
const { formData, deliverLock, deliverStop } = useFormData();
const { jobListHandle } = useDeliver();
const statisticCycle = ref(1);
const statisticCycleData = [
  { label: "近三日投递", help: "愿你每一次投递都能得到回应" },
  { label: "本周投递", help: "愿你早日找到心满意足的工作" },
  { label: "本月投递", help: "愿你在面试中得到满意的结果" },
  { label: "历史投递", help: "愿你能早九晚五还双休带五险" },
];

function startBatch() {
  deliverLock.value = true;
  Promise.all([
    findEl(".job-list-wrapper .search-job-result"),
    findEl(".job-list-wrapper .options-pages .ui-icon-arrow-right"),
  ])
    .then(async ([el, next]) => {
      console.log("start batch", el, next);
      if (next.parentElement) next = next.parentElement;
      else throw new Error("未找到下一页按钮");
      while (next.className !== "disabled" && !deliverStop.value) {
        await findAllEl(".job-card-wrapper", { el }).then(jobListHandle);
        if (deliverStop.value) {
          return;
        }
        (next as HTMLLinkElement).click();
        await delay(20000);
      }
    })
    .finally(() => {
      deliverLock.value = false;
      deliverStop.value = false;
    });
}

function stopBatch() {
  deliverStop.value = true;
}
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-statistic
        help="统计当天脚本投递的数量,boos直聘限制100,该记录并不准确"
        :value="138"
        title="今日投递："
        suffix="/ 100"
      ></el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic
        help="统计当天岗位过滤的比例,被过滤/总数"
        :value="138"
        title="过滤比例："
        suffix="%"
      ></el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic
        help="统计当天岗位中已沟通的比例,已沟通/总数"
        :value="138"
        title="沟通比例："
        suffix="%"
      ></el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic
        :help="statisticCycleData[statisticCycle].help"
        :value="138"
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
        help="点击开始就会开始投递"
        :loading="deliverLock"
        @click="startBatch"
      >
        开始
      </el-button>
      <el-button
        v-if="deliverLock && !deliverStop"
        type="warning"
        help="暂停后应该能继续"
        @click="stopBatch"
      >
        暂停
      </el-button>
      <el-button
        v-if="deliverLock && !deliverStop"
        type="danger"
        help="停止后应该不能继续"
        @click="stopBatch"
      >
        停止
      </el-button>
    </el-button-group>
    <el-progress help="我会倒车的噢" style="flex: 1" :percentage="100" />
  </div>
</template>

<style lang="scss" scoped></style>
