<script lang="ts" setup>
import { onMounted, ref, watch, watchEffect } from "vue";
import { ElTabPane, ElTabs, ElCheckbox, ElTooltip } from "element-plus";
import { findEl, removeEl } from "@/utils/element";

import { computed } from "vue";
import { useMouse, useMouseInElement } from "@vueuse/core";

import aboutVue from "./about.vue";
import aiVue from "./ai.vue";
import configVue from "./config.vue";
import logsVue from "./logs.vue";
import statisticsVue from "./statistics.vue";
const { x, y } = useMouse({ type: "client" });

const helpVisible = ref(false);
const searchRef = ref();
const tabsRef = ref();
const chatIframe = ref<HTMLIFrameElement | null>();
const helpContent = ref("鼠标移到对应元素查看提示");
const helpElWidth = ref(400);
const { isOutside } = useMouseInElement(tabsRef);

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
    // 搜索栏去APP
    removeEl(".job-search-scan", { el: searchEl });
  });
  findEl(".job-list-wrapper").then((jobListEl) => {
    // 新职位发布时通知我
    removeEl(".subscribe-weixin-wrapper", { el: jobListEl, retry: 20 });
  });

  // 侧栏
  removeEl(".job-side-wrapper");
  // 侧边悬浮框
  removeEl(".side-bar-box");
  // 搜索栏登录框
  removeEl(".go-login-btn");
});
</script>

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
      <statisticsVue></statisticsVue>
    </el-tab-pane>
    <el-tab-pane label="筛选" ref="searchRef" help="可能真的需要?帮助?" />
    <el-tab-pane label="配置" help="建议全文背诵">
      <configVue></configVue>
    </el-tab-pane>
    <el-tab-pane label="AI" help="AI时代，脚本怎么能落伍!">
      <aiVue></aiVue>
    </el-tab-pane>
    <el-tab-pane label="日志" help="反正你也不看">
      <logsVue></logsVue>
    </el-tab-pane>
    <el-tab-pane
      label="关于"
      class="hp-about-box"
      help="项目是写不完美的,但总要去追求完美"
    >
      <aboutVue></aboutVue>
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

.el-tabs__content {
  overflow: unset;
}
.page-job-wrapper {
  padding-top: 0 !important;
  .job-search-wrapper.fix-top {
    position: unset;
    width: unset;
    top: unset;
    z-index: unset;
    margin-top: unset;
    box-shadow: unset;
  }
}
</style>
