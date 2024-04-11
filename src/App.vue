<script lang="ts" setup>
import { ElMessage, ElDialog } from "element-plus";
import { logger } from "./utils/logger";
import {
  ElDropdown,
  ElButton,
  ElIcon,
  ElDropdownMenu,
  ElDropdownItem,
  ElAvatar,
} from "element-plus";
import { GM_deleteValue, GM_getValue, GM_listValues, GM_setValue } from "$";
import storeVue from "@/components/conf/store.vue";
import userVue from "@/components/conf/user.vue";
import logVue from "@/components/conf/log.vue";
import { onMounted, ref } from "vue";
logger.info("BoosHelper挂载成功");
ElMessage("BoosHelper挂载成功!");
const confBox = ref(false);
const confs = {
  store: { name: "存储配置", component: storeVue },
  user: { name: "账号配置", component: userVue },
  log: { name: "日志配置", component: logVue },
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
  document.documentElement.classList.toggle("dark", dark.value);
  GM_setValue("theme-dark", dark.value);
}
onMounted(() => {
  document.documentElement.classList.toggle("dark", dark.value);
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

<style lang="scss">
#boos-helper {
  position: fixed;
  top: 55px;
  right: 10px;
  z-index: 999;
}
.el-dropdown .el-avatar {
  border: 2px solid #fff;
  &:hover {
    border: 3px solid #c413e7;
  }
}
.el-dropdown-menu__item {
  justify-content: center;
}

#loader {
  width: 0;
  height: 4.8px;
  display: inline-block;
  position: relative;
  background: #54f98d;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  box-sizing: border-box;
  top: -14px;
  &::after,
  &::before {
    content: "";
    width: 10px;
    height: 1px;
    background: #fff;
    position: absolute;
    top: 9px;
    right: -2px;
    opacity: 0;
    transform: rotate(-45deg) translateX(0px);
    box-sizing: border-box;
    animation: coli1 0.3s linear infinite;
  }

  &::before {
    top: -4px;
    transform: rotate(45deg);
    animation: coli2 0.3s linear infinite;
  }

  @keyframes coli1 {
    0% {
      transform: rotate(-45deg) translateX(0px);
      opacity: 0.7;
    }

    100% {
      transform: rotate(-45deg) translateX(-45px);
      opacity: 0;
    }
  }

  @keyframes coli2 {
    0% {
      transform: rotate(45deg) translateX(0px);
      opacity: 1;
    }

    100% {
      transform: rotate(45deg) translateX(-45px);
      opacity: 0.7;
    }
  }
}
</style>
