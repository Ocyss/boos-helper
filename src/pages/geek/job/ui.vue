<script lang="ts" setup>
import { onMounted, ref, watch, watchEffect } from "vue";
import { ElTabPane, ElTabs, ElCheckbox, ElTooltip } from "element-plus";
import { findEl, removeEl } from "@/utils/element";
import cardVue from "./card.vue";
import { computed } from "vue";
import { useMouse, useMouseInElement } from "@vueuse/core";

import aboutVue from "./about.vue";
import aiVue from "./ai.vue";
import configVue from "./config.vue";
import logsVue from "./logs.vue";
import statisticsVue from "./statistics.vue";
import { useDeliver } from "./hooks/useDeliver";
import { useJobList } from "./hooks/useJobList";
import { usePager } from "./hooks/usePager";
const { initPager } = usePager();
const { initJobList } = useJobList();
const { x, y } = useMouse({ type: "client" });
const { total, current } = useDeliver();
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
  initJobList();
  initPager();
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
  <h2>
    Boos-Helper
    <span v-if="total > 0">{{ total - current }}/{{ total }}</span>
  </h2>
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
  <Teleport to=".page-job-inner .page-job-content">
    <cardVue></cardVue>
  </Teleport>
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
  .dark &.is-checked .el-checkbox__label {
    color: #cfd3dc !important;
  }
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
.el-tabs__content {
  overflow: unset;
}
</style>

<style lang="scss">
#wrap {
  min-width: unset;
}
.inner {
  width: unset;
}
.page-job-wrapper {
  padding-top: 0 !important;
  .page-job-inner,
  .job-search-wrapper {
    width: 65%;
    max-width: 870px;
    min-width: 320px;

    margin: 20px auto;
    &.fix-top {
      position: unset;
      margin-top: unset;
      box-shadow: unset;
    }
  }
}
.page-job-content,
.job-list-wrapper,
.job-card-wrapper {
  width: 100% !important;
}
.page-job-inner .page-job-content {
  display: flex;
  flex-direction: column;
  order: 2;
}
.job-card-wrapper {
  border: 3px solid transparent;
  .job-card-footer,
  .job-card-right,
  .job-card-body {
    display: flex;
  }
  .job-card-body {
    border-radius: 12px 12px 0 0;
  }

  .job-card-left .job-title,
  .salary,
  .job-card-right .company-name {
    font-size: clamp(0.625rem, 0.407rem + 1.09vw, 1rem) !important;
  }
  .tag-list li,
  .company-tag-list li,
  .info-desc {
    font-size: clamp(0.531rem, 0.368rem + 0.82vw, 0.813rem) !important;
  }
  .job-card-left {
    height: unset;
    padding: 16px 24px 12px;
    .job-name {
      margin-right: 12px;
    }
    .job-area-wrapper {
      margin-left: 0 !important;
    }
    .start-chat-btn,
    .info-public {
      display: inline-block;
    }
    .job-info {
      height: unset;
      overflow: unset;
      > * {
        margin: 3px;
      }
    }
  }
  .job-card-right {
    flex-wrap: wrap;
    .company-logo {
      margin-right: 12px;
      width: unset;
      height: unset;
      border: unset;
      border-radius: 15px;
      img {
        object-fit: contain;
        width: clamp(4.063rem, 3.699rem + 1.82vw, 4.688rem);
      }
    }
    .company-info {
      margin-left: 0;
    }
  }
  .job-card-footer {
    padding: 8px 12px 14px 12px;
  }

  .job-card-left .tag-list,
  .company-tag-list {
    height: unset;
    border: unset;
  }
}

.search-job-result .job-list-box {
  display: flex;
  flex-direction: column;

  .job-card-wrapper {
    margin: 16px auto;
  }
}
.job-search-box .job-search-form {
  width: 100%;
  display: flex;
  .city-label,
  .search-input-box {
    width: unset;
  }
  .search-input-box {
    flex: 1;
  }
  .search-btn {
    margin: 0 15px;
  }
}
.dark {
  body {
    background-color: #212121;
  }

  #header .inner:before,
  .page-job:before {
    background: unset;
  }
  .job-search-wrapper,
  .job-card-wrapper,
  .satisfaction-feedback-wrapper,
  .job-search-box .city-label,
  .job-search-box .search-input-box,
  .job-search-box .search-input-box input,
  .hot-link-wrapper {
    background-color: #292929;
  }
  .job-title,
  .info-desc,
  .tag-list li,
  .company-name a,
  .satisfaction-feedback-wrapper h3,
  .fast-next-btn,
  .search-map-btn,
  .city-label,
  .city-area-select .area-dropdown-item li,
  .city-area-select .city-area-tab li,
  .subway-select-wrapper .subway-line-list li,
  .condition-filter-select .current-select,
  .el-vl__wrapper,
  .el-checkbox__label,
  #boos-helper-job h2 {
    color: #cfd3dc !important;
  }
  .city-area-select .area-select-wrapper,
  .condition-filter-select,
  .condition-position-select.is-select .current-select,
  .job-card-body,
  .condition-industry-select {
    background-color: #434141;
  }
  .job-card-wrapper {
    transition: all 0.3s ease;
    position: relative;
    .job-card-footer {
      background: linear-gradient(90deg, #373737, #4d4b4b);
    }
    .job-card-left .start-chat-btn {
      background: rgb(0 190 189 / 70%);
    }
    .job-info .tag-list li,
    .info-public,
    .company-tag-list li {
      color: #cfd3dc !important;
      background: #44e1e326 !important;
      border: 0.5px solid #e5e6e678 !important;
    }
    .info-public em:before {
      height: 70%;
    }
  }
}
html.dark {
  --el-bg-color: #212020;
}
</style>
