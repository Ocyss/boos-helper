<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElTabPane, ElTabs, ElCheckbox, ElTooltip } from "element-plus";
import cardVue from "./card.vue";
import { computed } from "vue";
import { useMouse, useMouseInElement } from "@vueuse/core";
import chatVue from "@/components/chat/chat.vue";
import aboutVue from "./about.vue";
import aiVue from "./ai.vue";
import configVue from "./config.vue";
import logsVue from "./logs.vue";
import statisticsVue from "./statistics.vue";
import { useDeliver } from "./hooks/useDeliver";
import { useJobList } from "./hooks/useJobList";
import { usePager } from "./hooks/usePager";
import elmGetter from "@/utils/elmGetter";
import { netConf } from "@/utils/conf";
import { GM_getValue, GM_setValue } from "$";

const { initPager } = usePager();
const { initJobList } = useJobList();
const { x, y } = useMouse({ type: "client" });
const { total, current } = useDeliver();
const helpVisible = ref(false);
const searchRef = ref();
const tabsRef = ref();
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
  elmGetter
    .get([
      ".job-search-wrapper .job-search-box.clearfix",
      ".job-search-wrapper .search-condition-wrapper.clearfix",
    ])
    .then(([searchEl, conditionEl]) => {
      searchRef.value.$el.appendChild(searchEl);
      searchRef.value.$el.appendChild(conditionEl);
      // 搜索栏去APP
      elmGetter.rm(".job-search-scan", searchEl);
    });
});

function tagOpen(url: string) {
  window.open(url);
}
const VITE_VERSION = import.meta.env.VITE_VERSION;
const now = new Date().getTime();
</script>

<template>
  <h2 style="display: flex; align-items: center">
    Boos-Helper
    <el-badge
      :is-dot="(netConf?.version ?? '6') > VITE_VERSION"
      :offset="[-2, 7]"
      @click="tagOpen('https://greasyfork.org/zh-CN/scripts/491340')"
      style="cursor: pointer; display: inline-flex; margin: 0 4px"
    >
      <el-tag type="primary">v{{ VITE_VERSION }}</el-tag>
    </el-badge>

    <span v-if="total > 0">{{ current + 1 }}/{{ total }}</span>
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
  <div class="netAlerts" v-if="netConf && netConf.notification">
    <template
      v-for="item in netConf.notification.filter(
        (item) => item.type === 'alert'
      )"
      :key="item.key ?? item.data.title"
    >
      <el-alert
        v-if="now > GM_getValue(`netConf-${item.key}`, 0)"
        v-bind="item.data"
        @close="GM_setValue(`netConf-${item.key}`, now + 259200000)"
      />
    </template>
  </div>
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
    <el-tab-pane
      label="搜索"
      ref="searchRef"
      help="boos直聘原搜索, 可能出现空白bug"
    />
    <el-tab-pane label="筛选" help="好好看，好好学">
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
    <el-tab-pane v-if="netConf && netConf.feedback">
      <template #label>
        <el-link
          size="large"
          @click.stop="tagOpen(netConf.feedback)"
          style="height: 100%"
        >
          反馈
        </el-link>
      </template>
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
  <Teleport to=".page-job-wrapper">
    <chatVue
      style="
        position: fixed;
        top: 70px;
        left: 20px;
        height: calc(100vh - 80px);
        display: flex;
        flex-direction: column;
        width: 28%;
        max-width: 540px;
      "
    ></chatVue>
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
  html.dark & {
    color: #cfd3dc;
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
  overflow: unset !important;
}
</style>
