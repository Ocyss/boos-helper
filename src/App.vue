<script lang="ts" setup>
import { ElMessage } from "element-plus";
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
logger.info("BoosHelper挂载成功");
ElMessage("BoosHelper挂载成功!");

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
        <el-dropdown-item divided @click="clone">存储配置</el-dropdown-item>
        <el-dropdown-item>日志查看</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
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
</style>
