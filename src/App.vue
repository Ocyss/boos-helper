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
import { GM_deleteValue, GM_listValues } from "$";
import storeVue from "@/components/conf/store.vue";
import userVue from "@/components/conf/user.vue";
import logVue from "@/components/conf/log.vue";
import { ref } from "vue";
logger.info("BoosHelper挂载成功");
ElMessage("BoosHelper挂载成功!");
const confBox = ref(false);
const confs = {
  store: { name: "存储配置", component: storeVue },
  user: { name: "账号配置", component: userVue },
  log: { name: "日志配置", component: logVue },
};
const confKey = ref<keyof typeof confs>("store");

const clone = async () => {
  if (confirm("将清空脚本全部的设置!!")) {
    const asyncKeys = await GM_listValues();
    for (let index in asyncKeys) {
      if (!asyncKeys.hasOwnProperty(index)) {
        continue;
      }
      console.log(asyncKeys[index]);
      await GM_deleteValue(asyncKeys[index]);
    }
    window.alert("OK!");
  }
};
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
</style>
