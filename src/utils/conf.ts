import { getStorage, setStorage } from '@/utils/message/storage'
import { ElMessageBox, ElNotification } from 'element-plus'
import { ref } from 'vue'

export const netConf = ref<NetConf>()

export async function netNotification(item:
  | NotificationAlert
  | NotificationMessage
  | NotificationNotification, now: number = 0) {
  if (now !== 0 && now < await getStorage(`local:netConf-${item.key}`, 0)) {
    return
  }
  if (item.type === 'message') {
    void ElMessageBox.alert(item.data.content, item.data.title ?? 'message', {
      ...item.data,
      confirmButtonText: 'OK',
      callback: () => {
        void setStorage(
          `local:netConf-${item.key}`,
          now + (item.data.duration ?? 86400) * 1000,
        )
      },
    })
  }
  else if (item.type === 'notification') {
    void ElNotification({
      ...item.data,
      duration: 0,
      onClose() {
        void setStorage(
          `local:netConf-${item.key}`,
          now + (item.data.duration ?? 86400) * 1000,
        )
      },
      onClick() {
        item.data.url ?? window.open(item.data.url)
      },
    })
  }
}

window.__q_netNotification = netNotification

export interface NetConf {
  version: string
  version_description?: string
  notification: (
    | NotificationAlert
    | NotificationMessage
    | NotificationNotification
  )[]
  store?: Record<string, [string, string]>
  price_info?: {
    signedKey: number
    account: number
    update_time: string
  }
  feedback: string
}

export interface NotificationAlert {
  key?: string
  type: 'alert'
  data: import('element-plus').AlertProps
}

export interface NotificationMessage {
  key?: string
  type: 'message'
  data: { title?: string, content: string, duration?: number }
}

export interface NotificationNotification {
  key?: string
  type: 'notification'
  data: import('element-plus').NotificationProps & {
    url?: string
    duration?: number
  }
}
