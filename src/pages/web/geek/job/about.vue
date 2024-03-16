<script lang="ts" setup>
import { ElLink, ElImage } from "element-plus";
</script>

<template>
  <div class="hp-about" help="谢谢你的关心">
    <div help="梦想就是全职开源">
      作者:&#12288;
      <el-link href="https://github.com/Ocyss" target="_blank">
        Ocyss_04
      </el-link>
    </div>
    <div help="更应该感谢这些人">
      鸣谢:&#12288;
      <el-link href="https://github.com/yangfeng20" target="_blank">
        yangfeng20
      </el-link>
    </div>
  </div>
  <div
    class="hp-about"
    help="如果对你有帮助一定要Star呀!"
    style="margin-left: 20px"
  >
    <div>
      <el-link href="https://github.com/Ocyss" target="_blank" type="danger">
        Boss-Helper [Boos直聘助手]
      </el-link>
    </div>
    <div>
      <el-link
        href="https://greasyfork.org/zh-CN/scripts/468125-boss-batch-push-boss%E7%9B%B4%E8%81%98%E6%89%B9%E9%87%8F%E6%8A%95%E7%AE%80%E5%8E%86"
        target="_blank"
        type="danger"
      >
        Boss Batch Push [Boss直聘批量投简历]
      </el-link>
    </div>
  </div>
  <el-image
    help="可能并没什么用,只是不让页面空荡荡"
    style="width: 200px; height: 200px"
    src="https://img2.imgtp.com/2024/03/16/Jipx1nKP.png"
    fit="cover"
    loading="lazy"
  />
</template>

<style lang="scss" scoped></style>
