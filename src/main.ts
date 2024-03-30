import { ElMessage, ElMessageBox } from "element-plus";
import "element-plus/dist/index.css";
import * as url from "url";
import { logger } from "@/utils/logger";
import App from "./App.vue";
import { createApp, ref, watch } from "vue";

logger.debug("初始化");

const app = createApp(App);

function Hook() {
  // logger.info("加载/web/geek/chat页面Hook");
  // const OldSocket = WebSocket;
  // window.WebSocket = function (url: string | URL, protocols?: string[]) {
  //   logger.info("捕获到新Socket,", url);
  //   let s: WebSocket;
  //   if (
  //     !url.toString().includes("HOOK::") &&
  //     url.toString().includes("chatws")
  //   ) {
  //     logger.info("劫持到新的chatSocket,", url);
  //     const a = new TextDecoder("utf-8");
  //     const d = useWebSocket("HOOK::" + url, {
  //       protocols,
  //       // immediate:false,
  //       heartbeat: false,
  //       autoReconnect: false,
  //     });
  //     s = d.ws.value!;
  //     const oldSend = s.send.bind(s);
  //     s.send = (data: Uint8Array) => {
  //       let udata = new Uint8Array(data);
  //       try {
  //         if (udata[0] === 0x33) {
  //           const ma = mqtt.decode(udata);
  //           console.log("sendMa", data, ma);
  //           const m = AwesomeMessage.decode(ma.payload);
  //           AwesomeMessage;
  //           console.log("send", data, JSON.stringify(m));
  //         } else throw new Error("不是消息");
  //       } catch (e) {
  //         logger.error("解析失败", data, e);
  //       }
  //       oldSend(data);
  //     };
  //     if (window.top) window.top.socket = s;
  //     else window.socket = s;
  //   } else {
  //     s = new OldSocket(url.toString().replace("HOOK::", ""), protocols);
  //   }
  //   return s;
  // } as never;
}

// if (window.top !== window.self)
Hook();

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
    case "/web/geek/chat":
      // module = await import("./pages/web/geek/chat");
      break;
  }
  module.run();
}

logger.debug("开始运行");
start();

declare global {
  interface Window {
    socket: WebSocket;
    ChatWebsocket: {
      send(e: { toArrayBuffer(): ArrayBuffer }): void;
    };
    _PAGE: {
      checkMobileUrl: string;
      regMobileUrl: string;
      loginMobileUrl: string;
      loginAccountUrl: string;
      getRandomKeyUrl: string;
      verifyImgUrl: string;
      getPositionUrl: string;
      citySiteName: string;
      citySiteCode: string;
      skillsUrl: string;
      uid: number;
      name: string;
      face: string;
      token: string;
      clientIP: string;
      zp_token: string;
    };
  }
}
