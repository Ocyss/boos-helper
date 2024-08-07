import { ref } from "vue";
import { ElMessageBox, ElNotification } from "element-plus";
import { GM_getValue, GM_setValue } from "$";
export const netConf = ref<NetConf>();

fetch("https://qiu-config.oss-cn-beijing.aliyuncs.com/boos-helper-config.json")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    netConf.value = data;
    const now = new Date().getTime();
    netConf.value?.notification.forEach((item) => {
      if (now > GM_getValue(`netConf-${item.key}`, 0)) {
        if (item.type === "message") {
          ElMessageBox.alert(item.data.content, item.data.title ?? "message", {
            confirmButtonText: "OK",
            callback: () => {
              GM_setValue(
                `netConf-${item.key}`,
                now + (item.data.duration ?? 86400) * 1000
              );
            },
          });
        } else if (item.type === "notification") {
          ElNotification({
            ...item.data,
            duration: 0,
            onClose() {
              GM_setValue(
                `netConf-${item.key}`,
                now + (item.data.duration ?? 86400) * 1000
              );
            },
            onClick() {
              item.data.url ?? window.open(item.data.url);
            },
          });
        }
      }
    });
  });

export interface NetConf {
  version: string;
  notification: (
    | NotificationAlert
    | NotificationMessage
    | NotificationNotification
  )[];
  feedback: string;
}

export interface NotificationAlert {
  key?: string;
  type: "alert";
  data: import("element-plus").AlertProps;
}

export interface NotificationMessage {
  key?: string;
  type: "message";
  data: { title?: string; content: string; duration?: number };
}

export interface NotificationNotification {
  key?: string;
  type: "notification";
  data: import("element-plus").NotificationProps & {
    url?: string;
    duration?: number;
  };
}
