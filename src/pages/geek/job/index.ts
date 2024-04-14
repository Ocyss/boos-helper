import { logger } from "@/utils/logger";
import { createApp } from "vue";
import uiVue from "./ui.vue";
import elmGetter from "@/utils/elmGetter";
import "./index.scss";
async function mountVue() {
  const jobSearchWrapper = await elmGetter.get(".job-search-wrapper");
  if (document.querySelector("#boos-helper-job")) {
    return;
  }
  const app = createApp(uiVue);
  const jobEl = document.createElement("div");
  jobEl.id = "boos-helper-job";
  jobSearchWrapper.insertBefore(jobEl, jobSearchWrapper.firstElementChild);
  jobSearchWrapper.setAttribute("help", "出界了哇!");
  app.mount(jobEl);
}

function removeAd() {
  // 新职位发布时通知我
  elmGetter.rm(".job-list-wrapper .subscribe-weixin-wrapper");
  // 侧栏
  elmGetter.rm(".job-side-wrapper");
  // 侧边悬浮框
  elmGetter.rm(".side-bar-box");
  // 搜索栏登录框
  elmGetter.rm(".go-login-btn");
}

export async function run() {
  logger.info("加载/web/geek/job页面Hook");
  removeAd();
  mountVue();
}
