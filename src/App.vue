<script lang="ts" setup>
import { logger } from "./utils/logger";
import {
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElAvatar,
  ElMessageBox,
  Action,
  ElMessage,
} from "element-plus";
import { GM_deleteValue, GM_getValue, GM_listValues, GM_setValue } from "$";
import storeVue from "@/components/conf/store.vue";
import userVue from "@/components/conf/user.vue";
import logVue from "@/components/conf/log.vue";
import { onMounted, ref } from "vue";
import { useStore } from "./hooks/useStore";

logger.info("BoosHelper挂载成功");
ElMessage("BoosHelper挂载成功!");
const { storeInit } = useStore();
const confBox = ref(false);
const confs = {
  store: { name: "存储配置", component: storeVue, disabled: false },
  user: { name: "账号配置", component: userVue, disabled: true },
  log: { name: "日志配置", component: logVue, disabled: false },
};
const confKey = ref<keyof typeof confs>("store");
const dark = ref(GM_getValue("theme-dark", false));
const clone = async () => {
  if (confirm("将清空脚本全部的设置!!")) {
    const asyncKeys = await GM_listValues();
    for (let index in asyncKeys) {
      if (!asyncKeys.hasOwnProperty(index)) {
        continue;
      }
      logger.debug(asyncKeys[index]);
      await GM_deleteValue(asyncKeys[index]);
    }
    window.alert("OK!");
  }
};

function themeChange() {
  dark.value = !dark.value;
  if (dark.value) {
    ElMessage({
      message: "已切换到暗黑模式，如有样式没适配且严重影响使用，请反馈",
      duration: 5000,
      showClose: true,
    });
  }
  document.documentElement.classList.toggle("dark", dark.value);
  GM_setValue("theme-dark", dark.value);
}

// console.log(monkeyWindow, window, unsafeWindow);

onMounted(async () => {
  await storeInit();
  const protocol = "boos-protocol";
  const protocol_val = "2025/02/21";
  const protocol_date: string = GM_getValue(protocol);
  if (protocol_date !== protocol_val) {
    ElMessageBox.alert(
      `本项目完全重构成浏览器扩展，原功能与页面保持不变为前提，进行大量的bug修复和页面优化
预计2025年3月在chrome，edge等扩展商店上架，完全免费，欢迎打赏支持下

提前参与测试：
选择最新的 Pre-release 版本
https://github.com/Ocyss/boos-helper/releases

1. 遇到bug即时反馈，不会使用请加群，使用前先好好了解项目，阅读每一个标签和帮助
2. 帮助复选框 能随时进入和退出帮助模式, 配置内容较多, 好好观看
3. 配置最前面需要打钩启用，启用后需要保存配置
4. 配置项 包含/排除 能点击切换模式
5. 群已满，暂不创建，请勿私加开发者，我的时间也很宝贵, 请在github反馈，或者飞书问卷

本项目仅供学习交流，禁止用于商业用途
使用该脚本有一定风险(如黑号,封号,权重降低等)，本项目不承担任何责任
<img style="width: 200px; height: 200px;" src="https://qiu-config.oss-cn-beijing.aliyuncs.com/reward.png" style="object-fit: cover;"/>
Github开源地址: <a href="https://github.com/ocyss/boos-helper" target="_blank">https://github.com/ocyss/boos-helper</a>
greasyfork地址: <a href="https://greasyfork.org/zh-CN/scripts/491340" target="_blank">https://greasyfork.org/zh-CN/scripts/491340</a>
飞书反馈问卷(匿名): <a href="https://gai06vrtbc0.feishu.cn/share/base/form/shrcnmEq2fxH9hM44hqEnoeaj8g" target="_blank">https://gai06vrtbc0.feishu.cn/share/base/form/shrcnmEq2fxH9hM44hqEnoeaj8g</a>
飞书问卷结果: <a href="https://gai06vrtbc0.feishu.cn/share/base/view/shrcnrg8D0cbLQc89d7Jj7AZgMc" target="_blank">https://gai06vrtbc0.feishu.cn/share/base/view/shrcnrg8D0cbLQc89d7Jj7AZgMc</a>
飞书交流群: <a href="https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=410v5499-7193-411f-8258-94ae0cac4fc0" target="_blank">https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=410v5499-7193-411f-8258-94ae0cac4fc0</a>`,
      "注意事项",
      {
        autofocus: true,
        confirmButtonText: "了解并同意!",
        customStyle:
          "--el-messagebox-width: unset; white-space: pre-wrap; width: unset;" as any,
        callback: (action: Action) => {
          if (action === "confirm") {
            GM_setValue(protocol, protocol_val);
          }
        },
      }
    );
  }
});
</script>

<template>
  <el-dropdown trigger="click">
    <el-avatar
      :size="30"
      src="https://avatars.githubusercontent.com/u/68412205?v=4"
    >
      H
    </el-avatar>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item disabled>BossHelp配置项</el-dropdown-item>
        <el-dropdown-item divided disabled></el-dropdown-item>
        <el-dropdown-item
          v-for="(v, k) in confs"
          :key="k"
          @click="
            confKey = k;
            confBox = true;
          "
          :disabled="v.disabled"
        >
          {{ v.name }}
        </el-dropdown-item>
        <el-dropdown-item @click="themeChange">
          暗黑模式（{{ dark ? "开" : "关" }}）
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <Teleport to="body">
    <component :is="confs[confKey].component" v-model="confBox" />
  </Teleport>
</template>

<style lang="scss"></style>
