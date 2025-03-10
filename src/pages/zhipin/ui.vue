<script lang="ts" setup>
import { jobList } from '@/hooks/useJobList'
import { netConf } from '@/utils/conf'
import elmGetter from '@/utils/elmGetter'
import { useMouse, useMouseInElement } from '@vueuse/core'
import { ElCheckbox, ElTabPane, ElTabs, ElTooltip } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import aboutVue from './about.vue'
import aiVue from './ai.vue'
import cardVue from './card.vue'
import configVue from './config.vue'
import { useDeliver } from './hooks/useDeliver'
import { usePager } from './hooks/usePager'
import logsVue from './logs.vue'
import statisticsVue from './statistics.vue'

const { initPager } = usePager()
const { x, y } = useMouse({ type: 'client' })
const { total, current } = useDeliver()
const helpVisible = ref(false)
const searchRef = ref()
const tabsRef = ref()
const helpContent = ref('鼠标移到对应元素查看提示')
const { isOutside } = useMouseInElement(tabsRef)

const triggerRef = computed(() => {
  return {
    getBoundingClientRect() {
      return DOMRect.fromRect({
        width: 0,
        height: 0,
        x: x.value,
        y: y.value,
      })
    },
  }
})

const boxStyles = computed(() => {
  if (helpVisible.value && !isOutside.value) {
    const element = document.elementFromPoint(x.value, y.value)
    const el = findHelp(element as HTMLElement)
    if (el) {
      const bounding = el.getBoundingClientRect()
      return {
        width: `${bounding.width}px`,
        height: `${bounding.height}px`,
        left: `${bounding.left}px`,
        top: `${bounding.top}px`,
        display: 'block',
        backgroundColor: '#3eaf7c33',
        transition: 'all 0.08s linear',
      } as Record<string, string | number>
    }
  }
  return {
    display: 'none',
  }
})

function findHelp(dom: HTMLElement | null) {
  if (!dom)
    return
  const help = dom.dataset.help
  if (help) {
    helpContent.value = help
    return dom
  }
  return findHelp(dom.parentElement)
}

onMounted(() => {
  jobList.initJobList()
  initPager()
  if (location.href.includes('/web/geek/job-recommend')) {
    elmGetter
      .get<HTMLDivElement>(
        '.job-recommend-search',
      )
      .then((searchEl) => {
        searchEl.style.position = 'unset'
        searchRef.value.$el.appendChild(searchEl)
      })
  }
  else {
    elmGetter
      .get([
        '.job-search-wrapper .job-search-box.clearfix',
        '.job-search-wrapper .search-condition-wrapper.clearfix',
      ])
      .then(([searchEl, conditionEl]) => {
        searchRef.value.$el.appendChild(searchEl)
        searchRef.value.$el.appendChild(conditionEl)
        // 搜索栏去APP
        elmGetter.rm('.job-search-scan', searchEl)
      })
  }
})

function tagOpen(url: string) {
  window.open(url)
}
const VITE_VERSION = __APP_VERSION__
</script>

<template>
  <h2 style="display: flex; align-items: center">
    Boos-Helper
    <el-badge
      :is-dot="(netConf?.version ?? '0') > VITE_VERSION"
      :offset="[-2, 7]"
      style="cursor: pointer; display: inline-flex; margin: 0 4px"
      @click="tagOpen('https://greasyfork.org/zh-CN/scripts/491340')"
    >
      <el-tag type="primary">
        v{{ VITE_VERSION }}
      </el-tag>
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
  <div v-if="netConf && netConf.notification" class="netAlerts">
    <template
      v-for="item in netConf.notification.filter(
        (item) => item.type === 'alert',
      )"
      :key="item.key ?? item.data.title"
    >
      <!-- <el-alert
        v-if="now > GM_getValue(`netConf-${item.key}`, 0)"
        v-bind="item.data"
        @close="GM_setValue(`netConf-${item.key}`, now + 259200000)"
      /> -->
    </template>
  </div>
  <ElTooltip :visible="helpVisible && !isOutside" :virtual-ref="triggerRef">
    <template #content>
      <div :style="`width: auto;max-width:${boxStyles.width};font-size:17px;`">
        {{ helpContent }}
      </div>
    </template>
  </ElTooltip>
  <ElTabs ref="tabsRef" data-help="鼠标移到对应元素查看提示">
    <ElTabPane label="统计" data-help="失败是成功她妈">
      <ElAlert style="margin-bottom: 10px" title="数据并不完全准确，投递上限根据自身情况调整，过高的上限也许会适得其反" type="warning" />
      <statisticsVue />
    </ElTabPane>
    <ElTabPane
      ref="searchRef"
      label="搜索"
      data-help="boos直聘原搜索, 可能出现空白bug"
    >
      <ElAlert style="margin-bottom: 10px" title="如果卡片数据为空不完整，请点击任意的boos原筛选功能来手动刷新下。" type="info" />
    </ElTabPane>
    <ElTabPane label="筛选" data-help="好好看，好好学">
      <ElAlert style="margin-bottom: 10px" title="每一个配置都请先阅读完整的帮助文档，再进行配置" type="warning" />
      <configVue />
    </ElTabPane>
    <ElTabPane label="AI" data-help="AI时代，脚本怎么能落伍!">
      <aiVue />
    </ElTabPane>
    <ElTabPane label="日志" data-help="反正你也不看">
      <logsVue />
    </ElTabPane>
    <ElTabPane
      label="关于&赞赏"
      class="hp-about-box"
      data-help="项目是写不完美的,但总要去追求完美"
    >
      <aboutVue />
    </ElTabPane>
    <ElTabPane v-if="netConf && netConf.feedback">
      <template #label>
        <el-link
          size="large"
          style="height: 100%"
          @click.stop="tagOpen(netConf.feedback)"
        >
          反馈
        </el-link>
      </template>
    </ElTabPane>
    <ElTabPane>
      <template #label>
        <ElCheckbox
          v-model="helpVisible"
          label="帮助"
          size="large"
          @click.stop=""
        />
      </template>
    </ElTabPane>
  </ElTabs>
  <Teleport to="#boos-helper-job-warp,.page-job-inner .page-job-content">
    <cardVue />
  </Teleport>
  <!-- <Teleport to=".page-job-wrapper">
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
    />
  </Teleport> -->
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
