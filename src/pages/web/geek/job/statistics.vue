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
import { delay } from "@/utils";
const { formData } = useFormData();
const batchButLoad = ref(false);
const batchButStop = ref(false);
const statisticCycle = ref(1);
const statisticCycleData = [
  { label: "近三日投递", help: "愿你每一次投递都能得到回应" },
  { label: "本周投递", help: "愿你早日找到心满意足的工作" },
  { label: "本月投递", help: "愿你在面试中得到满意的结果" },
  { label: "历史投递", help: "愿你能早九晚五还双休带五险" },
];

function startBatch() {
  batchButLoad.value = true;
  Promise.all([
    findEl(".job-list-wrapper .search-job-result"),
    findEl(".job-list-wrapper .options-pages .ui-icon-arrow-right"),
  ])
    .then(async ([el, next]) => {
      if (next.parentElement) next = next.parentElement;
      else throw new Error("未找到下一页按钮");
      while (next.className !== "disabled" && !batchButStop.value) {
        await findAllEl(".job-card-wrapper", { el }).then(jobListHandle);
        if (batchButStop.value) {
          return;
        }
        (next as HTMLLinkElement).click();
        await delay(20000);
      }
    })
    .finally(() => {
      batchButLoad.value = false;
      batchButStop.value = false;
    });
}

function stopBatch() {
  batchButStop.value = true;
}

type jobFilterError = {
  msg: string;
  mods?: string;
};
async function jobListHandle(jobList: NodeListOf<Element>) {
  for (const i in jobList) {
    if (batchButStop.value) return;
    const fn = <E extends Element = Element>(
      selectors: string,
      action: (
        element: E,
        resolve: () => void,
        reject: (reason: jobFilterError) => void
      ) => void
    ): Promise<void> =>
      new Promise(async (resolve, reject) => {
        try {
          const element = await findEl<E>(selectors, { el: jobList[i] });
          action(element, resolve, reject);
        } catch (error: any) {
          reject({ msg: error.message || error, mods: "findEl" });
        }
      });

    const p: [string, Promise<any>][] = [];
    // 岗位名筛选
    if (formData.jobTitle.enable) {
      p.push([
        "岗位名筛选",
        fn(".job-title .job-name", (el, resolve, reject) => {
          const text = el.textContent;
          if (!text) return { msg: "岗位名为空" };
          for (const x of formData.jobTitle.value) {
            if (text.includes(x)) {
              if (formData.jobTitle.include) {
                return resolve();
              }
              return reject({
                msg: `岗位名含有排除关键词 [${x}]`,
                mods: "排除模式",
              });
            }
          }
          if (formData.jobTitle.include) {
            return reject({
              msg: "岗位名不包含关键词",
              mods: "包含模式",
            });
          }
          return resolve();
        }),
      ]);
    }
    // 公司名筛选
    if (formData.company.enable) {
      p.push([
        "公司名筛选",
        fn(".job-card-right .company-name a", (el, resolve, reject) => {
          const text = el.textContent;
          if (!text) return { msg: "岗位名为空" };
          for (const x of formData.company.value) {
            if (text.includes(x)) {
              if (formData.company.include) {
                return resolve();
              }
              return reject({
                msg: `岗位名含有排除关键词 [${x}]`,
                mods: "排除模式",
              });
            }
          }
          if (formData.company.include) {
            return reject({
              msg: "岗位名不包含关键词",
              mods: "包含模式",
            });
          }
          return resolve();
        }),
      ]);
    }
    // 薪资筛选
    if (formData.salaryRange.enable) {
      p.push([
        "薪资筛选",
        fn(".job-info .salary", (el, resolve, reject) => resolve()),
      ]);
    }
    // 公司规模筛选
    if (formData.companySizeRange.enable) {
      p.push([
        "公司规模筛选",
        fn(
          ".job-card-right .company-tag-list li:last-child",
          (el, resolve, reject) => resolve()
        ),
      ]);
    }
    ``;
    // 工作内容筛选
    if (formData.jobContent.enable) {
    }
    await delay(2000);
  }
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
        :loading="batchButLoad"
        @click="startBatch"
      >
        开始
      </el-button>
      <el-button
        v-if="batchButLoad && !batchButStop"
        type="warning"
        help="暂停后应该能继续"
        @click="stopBatch"
      >
        暂停
      </el-button>
      <el-button
        v-if="batchButLoad && !batchButStop"
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
