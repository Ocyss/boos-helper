<script lang="ts" setup>
import type { NetConf } from '@/stores/signedKey'
import type { Action } from 'element-plus'
import logVue from '@/components/conf/log.vue'
import storeVue from '@/components/conf/store.vue'
import userVue from '@/components/conf/user.vue'
import { store } from '@/components/icon/store'
import { logger } from '@/utils/logger'
import { getStorage, setStorage } from '@/utils/message/storage'
import {
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import { onMounted, ref } from 'vue'

const confBox = ref(false)

const confs = {
  store: { name: '存储配置', component: storeVue, disabled: true },
  user: { name: '账号配置', component: userVue, disabled: false },
  log: { name: '日志配置', component: logVue, disabled: true },
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

// logger.log(monkeyWindow, window, unsafeWindow);

const VITE_VERSION = __APP_VERSION__
const storeShow = ref(false)

window.__q_openStore = () => {
  storeShow.value = true
}
const netConf = ref<NetConf>()

function updateNetConf() {
  netConf.value = window.__q_netConf?.()
}

onMounted(async () => {
  logger.info('BossHelper挂载成功')
  ElMessage('BossHelper挂载成功!')

  const protocol = 'boss-protocol'
  const protocol_val = '2025/06/14'
  const protocol_date = await getStorage(protocol)
  if (protocol_date !== protocol_val) {
    ElMessageBox.alert(
      `1. 使用前先好好了解项目，阅读每一个标签和帮助
      2. 遇到bug即时反馈，不再维护交流群，遇到问题飞书表格或者GitHub反馈
3. 帮助复选框 能随时进入和退出帮助模式, 配置内容较多, 好好观看
4. 配置最前面需要打钩启用，启用后需要保存配置
6. 配置项 包含/排除 能点击切换模式
7. 投递在达到上限，或者页面无法滚动时会结束投递，反馈相关问题检查是否滚动到底了，无法刷出新岗位!

本项目仅供学习交流，禁止用于商业用途
使用该脚本有一定风险(如黑号,封号,权重降低等)，本项目不承担任何责任
<img style="width: 200px; height: 200px;" src="https://qiu-config.oss-cn-beijing.aliyuncs.com/reward.png" style="object-fit: cover;"/>
Github开源地址: <a href="https://github.com/ocyss/boos-helper" target="_blank">https://github.com/ocyss/boos-helper</a>
反馈结果会在对应记录中评论回复， 一般3-7天回复
飞书反馈问卷(匿名): <a href="https://gai06vrtbc0.feishu.cn/share/base/form/shrcnmEq2fxH9hM44hqEnoeaj8g" target="_blank">https://gai06vrtbc0.feishu.cn/share/base/form/shrcnmEq2fxH9hM44hqEnoeaj8g</a>
飞书问卷结果: <a href="https://gai06vrtbc0.feishu.cn/share/base/view/shrcnrg8D0cbLQc89d7Jj7AZgMc" target="_blank">https://gai06vrtbc0.feishu.cn/share/base/view/shrcnrg8D0cbLQc89d7Jj7AZgMc</a>`,
      '注意事项',
      {
        autofocus: true,
        confirmButtonText: '了解并同意!',
        dangerouslyUseHTMLString: true,
        customStyle:
          '--el-messagebox-width: unset; white-space: pre-wrap; width: unset;max-width: unset;' as never,
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
  <el-config-provider namespace="ehp">
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
          <ElDropdownItem @click="storeShow = true">
            版本信息
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
    <Teleport to="body">
      <component :is="confs[confKey].component" id="help-conf-box" v-model="confBox" />
    </Teleport>
    <el-dialog
      v-model="storeShow"
      title="BossHelper扩展商店"
      width="500"
      @open="updateNetConf"
    >
      <div>
        <div style="text-align: center;font-size: 14px;color: #606266;">
          你的版本: {{ VITE_VERSION }}
        </div>
        <div style="text-align: center;font-size: 14px;color: #606266;">
          最新版本: {{ netConf?.version ?? '暂未获取到版本信息' }}
        </div>
        <div style="text-align: center;font-size: 16px;color: #606266;">
          更新内容：
        </div>
        <div style="text-align: center;font-size: 14px;color: #606266; white-space: pre-line;">
          {{ netConf?.version_description ?? '暂未获取到更新日志' }}
        </div>
      </div>
      <el-space wrap>
        <a v-for="(item, key) in store" :key="key" class="store-item-a" :href="netConf?.store?.[key]?.[1] ?? item[2]" target="_blank">
          <div class="store-item">
            <component :is="item[0]" />
            <img :src="netConf?.store?.[key]?.[2] ?? item[3]" alt="store" style="height: 20px;">
            <el-text>{{ netConf?.store?.[key]?.[0] ?? item[1] }}</el-text>
          </div>
        </a>
      </el-space>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="storeShow = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-config-provider>
</template>

<style lang="scss">
.store-item-a{
  .store-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: column;
    width: 140px;
    height: 180px;
    background: aliceblue;
    padding: 10px;
    border: 1px solid #f6f6f7;
    border-radius: 12px;
    background-color: #f6f6f7;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .04), 0 1px 2px rgba(0, 0, 0, .06);
    transition: border-color .25s, background-color .25s;
}
&:hover{
  .store-item{
    background-color: #bbf8fa;
    border-color: #2fffd9;
  }
}
}
</style>
