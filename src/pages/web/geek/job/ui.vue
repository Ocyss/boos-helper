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
    <el-tab-pane label="统计">
      <div>今日投递: 总投递:</div>
      <div>
        <el-button
          type="primary"
          help="点击批量投递开始批量投简历，请先通过上方Boss的筛选功能筛选大致的范围，然后通过脚本的筛选进一步确认投递目标。"
        >
          开始投递
        </el-button>
      </div>
    </el-tab-pane>
    <el-tab-pane label="筛选" ref="searchRef"></el-tab-pane>
    <el-tab-pane label="配置">
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
          help="编辑自定义招呼语，当【发送自定义招呼语】打开时，投递后发送boss默认的招呼语后还会发送自定义招呼语；使用&lt;br&gt;
      \\n 换行；例子：【你好\\n我...】；内置变量 $JOBNAME$ $COMPANYNAME$
      $BOSSNAME$"
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
      </el-form>
      <el-button
        type="primary"
        help="保持下方脚本筛选项，用于后续直接使用当前配置。"
        @click="() => GM_setValue(formDataKey, toRaw(formData))"
      >
        保存配置
      </el-button>
      <el-button
        type="primary"
        help="因为boss不支持将自定义的招呼语设置为默认招呼语。开启表示发送boss默认的招呼语后还会发送自定义招呼语"
      >
        自动打招呼
      </el-button>
      <el-button
        type="primary"
        help="打开后会自动过滤掉最近未活跃的Boss发布的工作。以免浪费每天的100次机会。"
      >
        活跃度过滤
      </el-button>
      "6.可以在网站管理中打开通知权限,当停止时会自动发送桌面端通知提醒。"
    </el-tab-pane>
    <el-tab-pane label="AI">333</el-tab-pane>
    <el-tab-pane label="UI">333</el-tab-pane>
    <el-tab-pane label="日志">
      <iframe
        src="https://www.zhipin.com/web/geek/chat"
        frameborder="0"
        style="height: 1px; width: 1px; resize: both; overflow: auto"
      ></iframe>
    </el-tab-pane>
    <el-tab-pane label="关于" class="hp-about-box">
      <div class="hp-about">
        <div>
          作者:&#12288;
          <el-link href="https://github.com/Ocyss" target="_blank">
            Ocyss_04
          </el-link>
        </div>
        <div>
          鸣谢:&#12288;
          <el-link href="https://github.com/yangfeng20" target="_blank">
            yangfeng20
          </el-link>
        </div>
      </div>
      <div class="hp-about" style="margin-left: 20px">
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
} from "element-plus";
import { findEl, removeEl } from "@/utils/element";
import { GM_addValueChangeListener, GM_getValue, GM_setValue } from "$";
import { ScriptConfig } from "./config";
import { computed } from "vue";
import { useMouse, useMouseInElement } from "@vueuse/core";

const { x, y } = useMouse({ type: "client" });

const helpVisible = ref(false);
const searchRef = ref();
const tabsRef = ref();
const helpContent = ref("鼠标移到对应元素查看提示");
const helpElWidth = ref(400);
const { isOutside } = useMouseInElement(tabsRef);
const formDataKey = "web-geek-job-FormData";
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

onMounted(() => {
  Promise.all([
    findEl(".job-search-wrapper .job-search-box.clearfix"),
    findEl(".job-search-wrapper .search-condition-wrapper.clearfix"),
  ]).then(([searchEl, conditionEl]) => {
    searchRef.value.$el.appendChild(searchEl);
    searchRef.value.$el.appendChild(conditionEl);
    removeEl(".job-search-scan", { el: searchEl });
  });
  findEl(".job-list-wrapper").then((jobListEl) => {
    removeEl(".subscribe-weixin-wrapper", { el: jobListEl });
  });

  // 侧栏
  removeEl(".job-side-wrapper");
  // 侧边悬浮框
  removeEl(".side-bar-box");
  // 新职位发布时通知我
  removeEl(".subscribe-weixin-wrapper", { retry: 20, time: 500 });
  // 搜索栏登录框
  removeEl(".go-login-btn");
  // 搜索栏去APP
  removeEl(".job-search-scan", { retry: 20, time: 500 });

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
