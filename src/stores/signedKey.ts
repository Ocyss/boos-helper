import type { modelData } from '@/composables/useModel'
import type { components, paths } from '@/types/openapi'
import type { Middleware } from 'openapi-fetch'
import { useModel } from '@/composables/useModel'
import { useUser } from '@/stores/user'
import { getStorage, setStorage } from '@/utils/message/storage'
import { watchThrottled } from '@vueuse/core'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import createClient from 'openapi-fetch'
import { defineStore } from 'pinia'

type SignedKeyInfo = components['schemas']['KeyInfo']

export interface NetConf {
  version: string
  version_description?: string
  notification: (
    | NotificationAlert
    | NotificationMessage
    | NotificationNotification
  )[]
  store?: Record<string, [string, string, string]>
  price_info?: {
    signedKey: number
    account: number
    update_time: string
  }
  feedback: string
}

export interface NotificationAlert {
  key: string
  type: 'alert'
  data: import('element-plus').AlertProps
}

export interface NotificationMessage {
  key: string
  type: 'message'
  data: { title?: string, content: string, duration?: number }
}

export interface NotificationNotification {
  key: string
  type: 'notification'
  data: import('element-plus').NotificationProps & {
    url?: string
    duration?: number
  }
}

// logger.debug("import.meta.env",import.meta.env)

function sdbmCode(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = char + (hash << 6) + (hash << 16) - hash
  }
  return hash.toString()
}

export function signedKeyReqHandler(data: any, message = true): string | undefined {
  // logger.debug('请求响应', data)
  const { error } = data
  if (error != null) {
    let errMsg = '未知错误'
    if (error instanceof Error) {
      errMsg = error.message
    }
    else if (error instanceof Response) {
      errMsg = error.statusText
    }
    else if (typeof error === 'string') {
      errMsg = error
    }
    else if (error != null && typeof error === 'object') {
      if ('detail' in error) {
        errMsg = JSON.stringify(error.detail)
      }
      else if ('message' in error) {
        errMsg = JSON.stringify(error.message)
      }
    }
    if (message) {
      ElMessage.error(errMsg)
    }
    return errMsg
  }
}
export type Client = ReturnType<typeof createClient<paths>>
const baseUrl = (true || import.meta.env.PROD || import.meta.env.TEST || import.meta.env.WXT_TEST) ? 'https://boss-helper.ocyss.icu' : 'http://localhost:8002'

export const useSignedKey = defineStore('signedKey', () => {
  const signedKey = ref<string | null>(null)
  const signedKeyBak = ref<string | null>(null)
  const signedKeyInfo = ref<SignedKeyInfo>()
  const signedKeyStorageKey = 'sync:signedKey'
  const signedKeyInfoStorageKey = 'sync:signedKeyInfo'
  const user = useUser()
  const netConf = ref<NetConf>()

  const netNotificationMap = new Map<string, boolean>()

  const client = createClient<paths>({ baseUrl })

  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      if (request.headers.get('Authorization') == null) {
        request.headers.set('Authorization', `Bearer ${signedKey.value}`)
      }
      if (request.headers.get('BossHelperUserID') == null) {
        const uid = user.getUserId()
        if (uid != null) {
          request.headers.set('BossHelperUserID', uid.toString())
        }
      }
      return request
    },
  }

  client.use(authMiddleware)

  watch(signedKey, (v) => {
    if (v == null || v === '') {
      return
    }
    void setStorage(signedKeyStorageKey, v).catch((e) => {
      logger.error('保存密钥失败', e)
      ElMessage.error('保存密钥失败')
    })
  })

  watchThrottled(signedKeyInfo, (v) => {
    if (v == null) {
      return
    }
    void setStorage(signedKeyInfoStorageKey, toRaw(v)).catch((e) => {
      logger.error('保存密钥信息失败', e)
      ElMessage.error('保存密钥信息失败')
    })
  }, { throttle: 2000 })

  async function netNotification(item:
  | NotificationAlert
  | NotificationMessage
  | NotificationNotification, now: number = 0) {
    if (now !== 0 && now < await getStorage(`local:netConf-${item.key}`, 0)) {
      return
    }
    if (netNotificationMap.has(item.key)) {
      return
    }
    netNotificationMap.set(item.key, true)
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

  async function getSignedKeyInfo(token?: string) {
    const headers: Record<string, string | undefined> = {
      Authorization: `Bearer ${token ?? signedKey.value}`,
    }
    if (token == null && signedKey.value == null) {
      delete headers.Authorization
    }

    const data = await client.GET('/v1/key/info', {
      headers,
    })
    signedKeyReqHandler(data)
    return data.data
  }

  async function refreshSignedKeyInfo(token?: string) {
    void client.GET('/config')
      .then(async ({ data }) => {
        netConf.value = data as NetConf
        window.__q_netConf = () => netConf.value
        const now = new Date().getTime()
        return Promise.all(netConf.value?.notification.map(async item => netNotification(item, now)) ?? [])
      })
    if (token == null && (signedKey.value == null || signedKey.value === '')) {
      return false
    }
    const model = useModel()
    void client.GET('/v1/llm/model_list')
      .then(async ({ data }) => {
        model.modelData = [...model.modelData, ...(data as modelData[] ?? []).filter(item => !model.modelData.some(m => m.key === item.key))]
      })

    const data = await getSignedKeyInfo(token)
    signedKeyInfo.value = data
    return true
  }

  async function initSignedKey() {
    const key = await getStorage<string>(signedKeyStorageKey)
    if (key == null) {
      return
    }
    const info = await getStorage<SignedKeyInfo>(signedKeyInfoStorageKey)
    if (info != null) {
      signedKeyInfo.value = info
    }

    if (await refreshSignedKeyInfo(key)) {
      const userId = user.getUserId()?.toString()
      const matchedUser = signedKeyInfo.value?.users.find(item => item.user_id === userId)
      if (matchedUser == null) {
        signedKeyBak.value = key
      }
      else {
        signedKey.value = key
        void client.GET('/v1/llm/model_list')
          .then(async ({ data }) => {
            const model = useModel()
            model.modelData = [...model.modelData, ...(data as modelData[] ?? []).filter(item => !model.modelData.some(m => m.key === item.key))]
          })
      }
    }
  }

  async function updateResume() {
    const resume = await user.getUserResumeData(true)
    const code = sdbmCode(JSON.stringify(resume))
    let resp = await client.POST('/v1/key/resume', {
      body: {
        code,
      },
    })
    let errMsg = signedKeyReqHandler(resp)
    if (errMsg != null) {
      return
    }
    resp = await client.POST('/v1/key/resume', {
      body: {
        code,
        data: resume as any,
      },
    })
    errMsg = signedKeyReqHandler(resp)
    if (errMsg == null) {
      ElMessage.success('更新简历成功')
    }
  }

  return { signedKey, signedKeyBak, client, netConf, signedKeyReqHandler, initSignedKey, sdbmCode, updateResume, getSignedKeyInfo, refreshSignedKeyInfo, signedKeyInfo, netNotification }
})

window.__q_useSignedKey = useSignedKey
