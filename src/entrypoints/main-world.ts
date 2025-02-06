import { logger } from "@/utils/logger";
import App from "@/components/App.vue";
import { createApp } from "vue";
import {  loader } from "@/utils";
import { getRootVue } from "@/hooks/useVue";
import axios from "axios";

async function main(router: any) {
  let module = {
    run() {
      logger.info("BoosHelper加载成功");
      logger.warn("当前页面无对应hook脚本", router.path);
    },
  };
  switch (router.path) {
    case "/web/geek/job":
      module = await import("../pages/geek/job");
      break;
    case "/web/geek/chat":
      // module = await import("./pages/web/geek/chat");
      break;
  }
  module.run();
  const helper = document.querySelector("#boos-helper");
  if (!helper) {
    const app = createApp(App);
    const appEl = document.createElement("div");
    appEl.id = "boos-helper";
    document.body.append(appEl);
    app.mount(appEl);
  }
}

async function start() {
//   document.documentElement.classList.toggle(
//     "dark",
//     GM_getValue("theme-dark", false)
//   );

  const v = await getRootVue();
  v.$router.afterHooks.push(main);
  main(v.$route);
  let axiosLoad: () => void;
  axios.interceptors.request.use(
    function (config) {
      if (config.timeout) {
        axiosLoad = loader({ ms: config.timeout, color: "#F79E63" });
      }
      return config;
    },
    function (error) {
      if (axiosLoad) axiosLoad();
      return Promise.reject(error);
    }
  );
  axios.interceptors.response.use(
    function (response) {
      if (axiosLoad) axiosLoad();
      return response;
    },
    function (error) {
      if (axiosLoad) axiosLoad();
      return Promise.reject(error);
    }
  );
}

export default defineUnlistedScript(() => {
  start().catch((e) => {
    logger.error(e);
  });
});