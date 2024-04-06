import { ElMessage, ElMessageBox } from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import * as url from "url";
import { logger } from "@/utils/logger";
import App from "./App.vue";
import { createApp, ref, watch } from "vue";

logger.debug("初始化");
let t: NodeJS.Timeout;
// function Hook() {
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
// }

// if (window.top !== window.self)
// Hook();
async function start(e?: any) {
  // console.log(location.href, e);
  clearTimeout(t);
  t = setTimeout(async () => {
    const parsedUrl = new URL(location.href);
    let module = {
      run() {
        logger.info("BoosHelper加载成功");
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
    if (document.querySelector("#boos-helper")) {
      return;
    }
    const app = createApp(App);
    app.mount(
      (() => {
        const appEl = document.createElement("div");
        appEl.id = "boos-helper";
        document.body.append(appEl);
        return appEl;
      })()
    );
  }, 500);
}

logger.debug("开始运行");
start();

// const _wr = function (type: keyof History) {
//   var orig = history[type];
//   return function () {
//     // @ts-ignore
//     var rv = orig.apply(this, arguments);
//     var e = new Event(type);
//     // @ts-ignore
//     e.arguments = arguments;
//     window.dispatchEvent(e);
//     return rv;
//   };
// };
// history.pushState = _wr("pushState");
// history.replaceState = _wr("replaceState");
// window.addEventListener("popstate", start);
// window.addEventListener("hashchange", start);
// window.addEventListener("replaceState", start);
// window.addEventListener("pushState", start);

declare global {
  interface Window {
    socket: WebSocket;
    ChatWebsocket: {
      send(e: { toArrayBuffer(): ArrayBuffer }): void;
    };
    _PAGE: {
      isGeekChat: boolean;
      zp_token: string;
      userId: number;
      identity: number;
      encryptUserId: string;
      name: string;
      showName: string;
      tinyAvatar: string;
      largeAvatar: string;
      token: string;
      isHunter: boolean;
      clientIP: string;
      email: any;
      phone: any;
      brandName: any;
      doubleIdentity: boolean;
      recruit: boolean;
      agentRecruit: boolean;
      industryCostTag: number;
      gender: number;
      trueMan: boolean;
      studentFlag: boolean;
      completeDayStatus: boolean;
      complete: boolean;
      multiExpect: boolean;
      uid: number;
    };
  }
}
