import { ref } from "vue";
import { ElMessageBox, ElNotification } from "element-plus";
import { getStorage, setStorage } from "@/utils/storage";
export const netConf = ref<NetConf>();

fetch("https://qiu-config.oss-cn-beijing.aliyuncs.com/boos-helper-config.json")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    netConf.value = data;
    const now = new Date().getTime();
    netConf.value?.notification.forEach(async (item) => {
      if (now > await getStorage(`local:netConf-${item.key}`, 0)) {
        if (item.type === "message") {
          ElMessageBox.alert(item.data.content, item.data.title ?? "message", {
            confirmButtonText: "OK",
            callback: () => {
              setStorage(
                `local:netConf-${item.key}`,
                now + (item.data.duration ?? 86400) * 1000
              );
            },
          });
        } else if (item.type === "notification") {
          ElNotification({
            ...item.data,
            duration: 0,
            onClose() {
              setStorage(
                `local:netConf-${item.key}`,
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
