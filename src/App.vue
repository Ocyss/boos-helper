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
import { ref } from "vue";
logger.info("BoosHelper挂载成功");
ElMessage("BoosHelper挂载成功!");
const confBox = ref(false);
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
        <el-dropdown-item @click="clone">存储配置</el-dropdown-item>
        <el-dropdown-item @click="confBox = true">日志查看</el-dropdown-item>
        <el-dropdown-item @click="confBox = true">账户配置</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <el-dialog
    v-model="confBox"
    title="Tips"
    width="500"
    align-center
    destroy-on-close
    center
    :z-index="9999999999"
  >
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="confBox = false">Cancel</el-button>
        <el-button type="primary" @click="confBox = false">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
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
