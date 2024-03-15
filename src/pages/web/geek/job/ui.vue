<template>
  <h2>Boos-Helper</h2>
  <div
    style="
      z-index: 999;
      position: fixed;
      pointer-events: none;
      border-width: 1px;
    "
    :style="boxStyles"
  />
  <el-tooltip :visible="helpVisible && !isOutside" :virtual-ref="triggerRef">
    <template #content>
      <div :style="`width: auto;max-width:${helpElWidth}px;font-size:17px;`">
        {{ helpContent }}
      </div>
    </template>
  </el-tooltip>
  <el-tabs ref="tabsRef" help="鼠标移到对应元素查看提示">
    <el-tab-pane label="统计" help="失败是成功她妈">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic
            help="愿你每一次投递都能得到回应"
            :value="138"
            title="今日投递："
            suffix="/ 100"
          ></el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic
            help="愿你早日找到心满意足的工作"
            :value="138"
            title="过滤比例："
            suffix="%"
          ></el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic
            help="愿你在面试中得到满意的结果"
            :value="138"
            title="沟通比例："
            suffix="%"
          ></el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic
            help="愿你能早九晚五还双休带五险"
            :value="138"
            suffix="份"
          >
            <template #title>
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  本周投递：
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>近三日投递</el-dropdown-item>
                    <el-dropdown-item>本周投递</el-dropdown-item>
                    <el-dropdown-item>本月投递</el-dropdown-item>
                    <el-dropdown-item>历史投递</el-dropdown-item>
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
    </el-tab-pane>
    <el-tab-pane
      label="筛选"
      ref="searchRef"
      help="可能真的需要?帮助?"
    ></el-tab-pane>
    <el-tab-pane label="配置" help="建议全文背诵">
      <el-form
        ref="formRef"
        inline
        label-position="left"
        label-width="auto"
        :model="formData"
      >
        <el-form-item
          help="投递工作的公司名一定包含或不包含在当前集合中，模糊匹配，可用于只投或不投某个公司/子公司。"
        >
          <template #label>
            <el-checkbox
              v-model="formData.company.enable"
              label="公司名"
              size="small"
            />
            <el-link
              @click.stop="formData.company.include = !formData.company.include"
              :type="formData.company.include ? 'primary' : 'warning'"
              size="small"
            >
              {{ formData.company.include ? "包含" : "排除" }}
            </el-link>
          </template>
          <el-select
            v-model="formData.company.value"
            multiple
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            style="width: 240px"
            placeholder=""
          >
            <el-option
              v-for="item in formData.company.options.map((i) => {
                return { label: i, value: i };
              })"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          help="投递工作的岗位名一定包含或不包含在当前集合中，模糊匹配，可用于只投或不投某个岗位名。"
        >
          <template #label>
            <el-checkbox label="岗位名" size="small" />
            <el-link
              @click.stop="
                formData.jobTitle.include = !formData.jobTitle.include
              "
              :type="formData.jobTitle.include ? 'primary' : 'warning'"
              size="small"
            >
              {{ formData.jobTitle.include ? "包含" : "排除" }}
            </el-link>
          </template>
          <el-select
            v-model="formData.jobTitle.value"
            multiple
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            style="width: 240px"
            placeholder=""
          >
            <el-option
              v-for="item in formData.jobTitle.options.map((i) => {
                return { label: i, value: i };
              })"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          help="会自动检测上文(不是,不,无需等关键字),下文(系统,工具),例子：【外包,上门,销售,驾照】，如果写着是'不是外包''销售系统'那也不会被排除"
        >
          <template #label>
            <el-checkbox label="工作内容" size="small" />
            <el-link
              @click.stop="
                formData.jobContent.include = !formData.jobContent.include
              "
              :type="formData.jobContent.include ? 'primary' : 'warning'"
              size="small"
            >
              {{ formData.jobContent.include ? "包含" : "排除" }}
            </el-link>
          </template>
          <el-select
            v-model="formData.jobContent.value"
            multiple
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            style="width: 240px"
            placeholder=""
          >
            <el-option
              v-for="item in formData.jobContent.options.map((i) => {
                return { label: i, value: i };
              })"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          help="投递工作的薪资范围一定在当前区间中，一定是区间，使用-连接范围。例如：【12-20】"
        >
          <template #label>
            <el-checkbox label="薪资范围" size="small" />
          </template>
          <el-input v-model="formData.salaryRange.value" style="width: 240px" />
        </el-form-item>
        <el-form-item
          help="投递工作的公司人员范围一定在当前区间中，一定是区间，使用-连接范围。例如：【500-20000000】"
        >
          <template #label>
            <el-checkbox label="公司规模范围" size="small" />
          </template>
          <el-input
            v-model="formData.companySizeRange.value"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item
          help="因为boss不支持将自定义的招呼语设置为默认招呼语。开启表示发送boss默认的招呼语后还会发送自定义招呼语, 使用&lt;br&gt;\\n 换行；例子：【你好\\n我...】"
        >
          <template #label>
            <el-checkbox label="自定义招呼语" size="small" />
          </template>
          <el-input
            v-model="formData.customGreeting.value"
            style="width: 240px"
            type="textarea"
          />
        </el-form-item>
        <div>
          <el-checkbox
            help="打开将替换招呼语中的部分单词为对应信息；JOBNAME:岗位名 COMPANYNAME:公司名
      BOSSNAME:招聘人"
            label="招呼语变量"
            border
          />
          <el-checkbox
            help="打开后会自动过滤掉最近未活跃的Boss发布的工作。以免浪费每天的100次机会。"
            label="活跃度过滤"
            border
          />
          <el-checkbox
            help="可以在网站管理中打开通知权限,当停止时会自动发送桌面端通知提醒。"
            label="发送通知"
            border
          />
        </div>
      </el-form>
      <div style="margin-top: 15px">
        <el-button
          type="primary"
          help="保持下方脚本筛选项，用于后续直接使用当前配置。"
          @click="() => GM_setValue(formDataKey, toRaw(formData))"
        >
          保存配置
        </el-button>
        <el-button type="primary" help="">重载配置</el-button>
        <el-button type="primary" help="">导出配置</el-button>
        <el-button type="primary" help="">导入配置</el-button>
        <el-button type="primary" help="">删除配置</el-button>
      </div>
    </el-tab-pane>
    <el-tab-pane label="AI" help="我可是为了你,重写了整个项目啊!">
      哼,你又在画大饼啦??
    </el-tab-pane>
    <el-tab-pane label="日志" help="反正你也不看">
      <iframe
        src="https://www.zhipin.com/web/geek/chat"
        frameborder="0"
        style="height: 1px; width: 1px; resize: both; overflow: auto"
      ></iframe>
      下次在写哇
    </el-tab-pane>
    <el-tab-pane
      label="关于"
      class="hp-about-box"
      help="项目是写不完美的,但总要去追求完美"
    >
      <div class="hp-about" help="谢谢你的关心">
        <div help="梦想就是全职开源">
          作者:&#12288;
          <el-link href="https://github.com/Ocyss" target="_blank">
            Ocyss_04
          </el-link>
        </div>
        <div help="更应该感谢这些人">
          鸣谢:&#12288;
          <el-link href="https://github.com/yangfeng20" target="_blank">
            yangfeng20
          </el-link>
        </div>
      </div>
      <div
        class="hp-about"
        help="如果对你有帮助一定要Star呀!"
        style="margin-left: 20px"
      >
        <div>
          <el-link
            href="https://github.com/Ocyss"
            target="_blank"
            type="danger"
          >
            Boss-Helper [Boos直聘助手]
          </el-link>
        </div>
        <div>
          <el-link
            href="https://greasyfork.org/zh-CN/scripts/468125-boss-batch-push-boss%E7%9B%B4%E8%81%98%E6%89%B9%E9%87%8F%E6%8A%95%E7%AE%80%E5%8E%86"
            target="_blank"
            type="danger"
          >
            Boss Batch Push [Boss直聘批量投简历]
          </el-link>
        </div>
      </div>
      <el-image
        help="可能并没什么用,只是不让页面空荡荡"
        style="width: 200px; height: 200px"
        src="https://img2.imgtp.com/2024/03/16/Jipx1nKP.png"
        fit="cover"
        loading="lazy"
      />
    </el-tab-pane>
    <el-tab-pane>
      <template #label>
        <el-checkbox
          v-model="helpVisible"
          label="帮助"
          size="large"
          @click.stop=""
        />
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, onUnmounted, toRaw } from "vue";
import {
  ElButton,
  ElTabPane,
  ElTabs,
  ElLink,
  ElForm,
  ElFormItem,
  ElInput,
  ElCheckbox,
  ElTooltip,
  ElSelect,
  ElOption,
  ElButtonGroup,
  ElImage,
  ElRow,
  ElCol,
  ElStatistic,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElProgress,
} from "element-plus";
import { findAllEl, findEl, removeEl } from "@/utils/element";
import { GM_addValueChangeListener, GM_getValue, GM_setValue } from "$";
import { ScriptConfig } from "./config";
import { computed } from "vue";
import { useMouse, useMouseInElement } from "@vueuse/core";
import { delay } from "@/utils";

const { x, y } = useMouse({ type: "client" });

const helpVisible = ref(false);
const searchRef = ref();
const tabsRef = ref();
const helpContent = ref("鼠标移到对应元素查看提示");
const helpElWidth = ref(400);
const { isOutside } = useMouseInElement(tabsRef);
const formDataKey = "web-geek-job-FormData";
const batchButLoad = ref(false);
const batchButStop = ref(false);
const formData = reactive(
  GM_getValue(formDataKey, {
    company: {
      include: false,
      value: [],
      options: [],
      enable: false,
    }, // 公司名
    jobTitle: {
      include: false,
      value: [],
      options: [],
      enable: false,
    }, // 工作名
    jobContent: {
      include: false,
      value: [],
      options: [],
      enable: false,
    }, // 工作内容
    salaryRange: {
      value: "",
      enable: false,
    }, // 薪资范围
    companySizeRange: {
      value: "",
      enable: false,
    }, // 公司规模范围
    customGreeting: {
      value: "",
      enable: false,
    }, // 自定义招呼语
  })
);

const triggerRef = computed(() => {
  return {
    getBoundingClientRect() {
      return DOMRect.fromRect({
        width: 0,
        height: 0,
        x: x.value,
        y: y.value,
      });
    },
  };
});

const boxStyles = computed(() => {
  if (helpVisible.value && !isOutside.value) {
    const element = document.elementFromPoint(x.value, y.value);
    const el = findHelp(element);
    if (el) {
      const bounding = el.getBoundingClientRect();
      helpElWidth.value = bounding.width;
      return {
        width: `${bounding.width}px`,
        height: `${bounding.height}px`,
        left: `${bounding.left}px`,
        top: `${bounding.top}px`,
        display: "block",
        backgroundColor: "#3eaf7c33",
        transition: "all 0.08s linear",
      } as Record<string, string | number>;
    }
  }
  return {
    display: "none",
  };
});

function findHelp(dom: Element | null) {
  if (!dom) return;
  const help = dom.getAttribute("help");
  if (help) {
    helpContent.value = help;
    return dom;
  }
  return findHelp(dom.parentElement);
}

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

async function jobListHandle(jobList: NodeListOf<Element>) {
  for (const i in jobList) {
    if (batchButStop.value) return;
    const card = jobList[i];
    console.log(card);
    await delay(2000);
  }
}

onMounted(() => {
  Promise.all([
    findEl(".job-search-wrapper .job-search-box.clearfix"),
    findEl(".job-search-wrapper .search-condition-wrapper.clearfix"),
  ]).then(([searchEl, conditionEl]) => {
    searchRef.value.$el.appendChild(searchEl);
    searchRef.value.$el.appendChild(conditionEl);
    // 搜索栏去APP
    removeEl(".job-search-scan", { el: searchEl });
  });
  findEl(".job-list-wrapper").then((jobListEl) => {
    // 新职位发布时通知我
    removeEl(".subscribe-weixin-wrapper", { el: jobListEl });
  });

  // 侧栏
  removeEl(".job-side-wrapper");
  // 侧边悬浮框
  removeEl(".side-bar-box");
  // 搜索栏登录框
  removeEl(".go-login-btn");
  GM_addValueChangeListener(ScriptConfig.PUSH_COUNT, () => {});
});
</script>

<style lang="scss">
#boos-helper-job {
  margin-bottom: 8px;
  * {
    user-select: none;
  }
}

.hp-about-box {
  display: flex;
  .hp-about {
    display: flex;
    flex-direction: column;
  }
}

.el-checkbox {
  color: #5e5e5e;
  &.is-checked .el-checkbox__label {
    color: #000000 !important;
  }
}
.job-search-wrapper.fix-top {
  position: relative !important;
}
.el-form {
  .el-link {
    font-size: 12px;
  }
  .el-form-item__label {
    display: flex;
    align-items: center;
  }
  .el-checkbox__label {
    padding-left: 4px;
  }
}

.job-search-wrapper,
.page-job-content {
  width: 90% !important;
  max-width: 950px;
}
.job-list-wrapper,
.job-card-wrapper,
.job-search-wrapper.fix-top {
  width: 100% !important;
}
.job-card-wrapper .job-card-body {
  display: flex;
  justify-content: space-between;
}
.job-card-wrapper .job-card-left {
  width: 50% !important;
}
.job-card-wrapper .start-chat-btn,
.job-card-wrapper:hover .info-public {
  display: initial !important;
}
.job-card-wrapper .job-card-footer {
  min-height: 48px;
  display: flex;
  justify-content: space-between;
}
.job-card-wrapper .clearfix:after {
  content: none;
}
.job-card-wrapper .job-card-footer .info-desc {
  width: auto !important;
}
.job-card-wrapper .job-card-footer .tag-list {
  width: auto !important;
  margin-right: 10px;
}
.city-area-select.pick-up .city-area-dropdown {
  width: 80vw;
  min-width: 1030px;
}
.job-search-box .job-search-form {
  width: 100%;
}
.job-search-box .job-search-form .city-label {
  width: 10%;
}
.job-search-box .job-search-form .search-input-box {
  width: 82%;
}
.job-search-box .job-search-form .search-btn {
  width: 8%;
}
.job-search-wrapper.fix-top .job-search-box,
.job-search-wrapper.fix-top .search-condition-wrapper {
  width: 90%;
  min-width: 990px;
}

#main.inner {
  width: auto;
  margin: 0 30px;
}
.system-search-condition {
  width: auto !important;
}
</style>
