import { logger } from "@/utils/logger";
import { createApp } from "vue";
import uiVue from "./ui.vue";

export async function run() {
  logger.slice("加载/web/geek/job页面Hook");
  let timingCutPageTask = setInterval(() => {
    const jobSearchWrapper = document.querySelector(".job-search-wrapper");
    if (!jobSearchWrapper) {
      return;
    }
    if (document.querySelector("boos-helper-job")) {
      return;
    }
    const app = createApp(uiVue);
    app.mount(
      (() => {
        const jobEl = document.createElement("div");
        jobEl.id = "boos-helper-job";
        jobSearchWrapper.insertBefore(
          jobEl,
          jobSearchWrapper.firstElementChild
        );
        jobSearchWrapper.setAttribute("help", "出界了哇!");
        return jobEl;
      })()
    );
    clearInterval(timingCutPageTask);
    return;
  }, 500);
}
