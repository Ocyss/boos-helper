<script lang="ts" setup>
import { ElLink, ElImage } from "element-plus";
</script>

<template>
  <div>
    <div style="display: flex; align-items: center">
      <div class="hp-about" help="谢谢你的关心">
        <div help="愿为理想执着行，前路漫漫自铸金。">
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
          <el-link
            href="https://github.com/Ocyss"
            target="_blank"
            type="danger"
          >
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
    </div>
    <div help="记得来个Star或者好评吧" style="margin-top: 10px">
      本插件完全免费开源且无广告, 如果有问题请反馈
      <br />
      Github开源地址:
      <el-link href="https://github.com/ocyss/boos-helper" target="_blank">
        https://github.com/ocyss/boos-helper
      </el-link>
      <br />
      greasyfork地址:
      <el-link
        href="https://greasyfork.org/zh-CN/scripts/491340"
        target="_blank"
      >
        https://greasyfork.org/zh-CN/scripts/491340
      </el-link>
      <br />
      <br />
      <el-space wrap>
        <el-link
          href="https://gai06vrtbc0.feishu.cn/share/base/form/shrcnmEq2fxH9hM44hqEnoeaj8g"
          target="_blank"
        >
          飞书反馈问卷(匿名)
        </el-link>

        <el-link
          href="https://gai06vrtbc0.feishu.cn/share/base/view/shrcnrg8D0cbLQc89d7Jj7AZgMc"
          target="_blank"
        >
          飞书问卷结果
        </el-link>

        <el-link
          href="https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=410v5499-7193-411f-8258-94ae0cac4fc0"
          target="_blank"
        >
          飞书交流群
        </el-link>
      </el-space>
    </div>
    <div
      help=" "
      style="width: 60%; margin-top: 20px; user-select: text; color: #fff"
    >
      除非不可抗因素，一般情况下不会停更，这个项目不止是帮助你们，也能帮到我
      <br />
    </div>
  </div>
  <el-image
    help="可能并没什么用,只是不让页面空荡荡"
    style="width: 200px; height: 200px"
    src="https://qiu-config.oss-cn-beijing.aliyuncs.com/reward.png"
    fit="cover"
    :preview-src-list="[
      'https://qiu-config.oss-cn-beijing.aliyuncs.com/reward.png',
    ]"
    loading="lazy"
  />
</template>

<style lang="scss" scoped></style>
