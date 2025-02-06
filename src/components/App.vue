<script lang="ts" setup>
import type {
  Action,
} from 'element-plus'
import logVue from '@/components/conf/log.vue'

import storeVue from '@/components/conf/store.vue'
import userVue from '@/components/conf/user.vue'
import { useStore } from '@/hooks/useStore'
import { logger } from '@/utils/logger'
import { getStorage, setStorage } from '@/utils/storage'
import {
  ElAvatar,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import { onMounted, ref } from 'vue'

logger.info('BoosHelper挂载成功')
ElMessage('BoosHelper挂载成功!')
const { storeInit } = useStore()
const confBox = ref(false)
const confs = {
  store: { name: '存储配置', component: storeVue, disabled: false },
  user: { name: '账号配置', component: userVue, disabled: true },
  log: { name: '日志配置', component: logVue, disabled: false },
}
const confKey = ref<keyof typeof confs>('store')
const dark = ref(false)

getStorage('theme-dark', false).then((res) => {
  dark.value = res
})

async function themeChange() {
  dark.value = !dark.value
  if (dark.value) {
    ElMessage({
      message: '已切换到暗黑模式，如有样式没适配且严重影响使用，请反馈',
      duration: 5000,
      showClose: true,
    })
  }
  document.documentElement.classList.toggle('dark', dark.value)
  await setStorage('theme-dark', dark.value)
}

// console.log(monkeyWindow, window, unsafeWindow);

onMounted(async () => {
  await storeInit()
  const protocol = 'boos-protocol'
  const protocol_val = '2024/09/06'
  const protocol_date = await getStorage(protocol)
  if (protocol_date !== protocol_val) {
    ElMessageBox.alert(
      `1. 遇到bug即时反馈，不会使用请加群，使用前先好好了解项目，阅读每一个标签和帮助
2. 帮助复选框 能随时进入和退出帮助模式, 配置内容较多, 好好观看
3. 配置最前面需要打钩启用，启用后需要保存配置
4. 配置项 包含/排除 能点击切换模式

本项目仅供学习交流，禁止用于商业用途
使用该脚本有一定风险(如黑号,封号,权重降低等)，本项目不承担任何责任

Github开源地址: https://github.com/ocyss/boos-helper
greasyfork地址: https://greasyfork.org/zh-CN/scripts/491340
飞书反馈问卷(匿名): https://gai06vrtbc0.feishu.cn/share/base/form/shrcnmEq2fxH9hM44hqEnoeaj8g
飞书问卷结果: https://gai06vrtbc0.feishu.cn/share/base/view/shrcnrg8D0cbLQc89d7Jj7AZgMc
飞书交流群: https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=410v5499-7193-411f-8258-94ae0cac4fc0`,
      '注意事项',
      {
        autofocus: true,
        confirmButtonText: '了解并同意!',
        customStyle:
          '--el-messagebox-width: unset; white-space: pre-wrap; width: unset;' as any,
        callback: (action: Action) => {
          if (action === 'confirm') {
            setStorage(protocol, protocol_val)
          }
        },
      },
    )
  }
})
</script>

<template>
  <ElDropdown trigger="click">
    <ElAvatar
      :size="30"
      src="https://avatars.githubusercontent.com/u/68412205?v=4"
    >
      H
    </ElAvatar>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem disabled>
          BossHelp配置项
        </ElDropdownItem>
        <ElDropdownItem divided disabled />
        <ElDropdownItem
          v-for="(v, k) in confs"
          :key="k"
          :disabled="v.disabled"
          @click="
            confKey = k;
            confBox = true;
          "
        >
          {{ v.name }}
        </ElDropdownItem>
        <ElDropdownItem @click="themeChange">
          暗黑模式（{{ dark ? "开" : "关" }}）
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
  <Teleport to="body">
    <component :is="confs[confKey].component" v-model="confBox" />
  </Teleport>
</template>

<style lang="scss"></style>
