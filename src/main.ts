import { ElMessage, ElMessageBox } from "element-plus";
import "element-plus/dist/index.css";
import * as url from "url";
import { logger } from "@/utils/logger";
import App from "./App.vue";
import { createApp } from "vue";
logger.debug("初始化");

const app = createApp(App);

app.mount(
  (() => {
    const appEl = document.createElement("div");
    appEl.id = "boos-helper";
    document.body.append(appEl);
    return appEl;
  })()
);

async function start() {
  const parsedUrl = new URL(location.href);
  logger.info("BoosHelper加载成功");
  let module = {
    run() {
      logger.warn("当前页面无对应hook脚本", parsedUrl.pathname);
    },
  };
  switch (parsedUrl.pathname) {
    case "/web/geek/job":
      module = await import("./pages/web/geek/job");
      break;
  }
  module.run();
}

logger.debug("开始运行");
start();
