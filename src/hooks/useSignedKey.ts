import type { NetConf } from '@/utils/conf'
import type { Middleware } from 'openapi-fetch'
import type { components, paths } from '../types/openapi'
import type { modelData } from './useModel'
import { netConf, netNotification } from '@/utils/conf'
import { getStorage, setStorage } from '@/utils/message/storage'
import { watchThrottled } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import createClient from 'openapi-fetch'
import { useModel } from './useModel'
import { getUserId } from './useUser'

export const client = createClient<paths>({ baseUrl: (import.meta.env.PROD || import.meta.env.TEST) ? 'https://boss-helper.ocyss.icu' : 'http://localhost:8002' })

type SignedKeyInfo = components['schemas']['KeyInfo']

const signedKey = ref<string | null>(null)
const signedKeyBak = ref<string | null>(null)
const signedKeyInfo = ref<SignedKeyInfo>()
const signedKeyStorageKey = 'sync:signedKey'
const signedKeyInfoStorageKey = 'sync:signedKeyInfo'

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (request.headers.get('Authorization') == null) {
      request.headers.set('Authorization', `Bearer ${signedKey.value}`)
    }
    if (request.headers.get('BossHelperUserID') == null) {
      const uid = getUserId()
      if (uid != null) {
        request.headers.set('BossHelperUserID', uid.toString())
      }
    }
    return request
  },
}

client.use(authMiddleware)

export function signedKeyReqHandler(data: any, message = true): string | undefined {
  logger.debug('请求响应', data)
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
  const { modelData } = useModel()
  void client.GET('/v1/llm/model_list')
    .then(async ({ data }) => {
      modelData.value = [...modelData.value, ...(data as modelData[] ?? []).filter(item => !modelData.value.some(m => m.key === item.key))]
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
    const userId = getUserId()?.toString()
    const user = signedKeyInfo.value?.users.find(item => item.user_id === userId)
    if (user == null) {
      signedKeyBak.value = key
    }
    else {
      signedKey.value = key
      void client.GET('/v1/llm/model_list')
        .then(async ({ data }) => {
          const { modelData } = useModel()
          modelData.value = [...modelData.value, ...(data as modelData[] ?? []).filter(item => !modelData.value.some(m => m.key === item.key))]
        })
    }
  }
}

const sdbmCode = function (str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = char + (hash << 6) + (hash << 16) - hash
  }
  return hash.toString()
}

async function updateResume() {
  const resume = await getUserResumeData(true)
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

export function useSignedKey() {
  return {
    signedKeyClient: client,
    signedKey,
    signedKeyBak,
    signedKeyInfo,
    getSignedKeyInfo,
    refreshSignedKeyInfo,
    initSignedKey,
    signedKeyReqHandler,
    netConf,
    updateResume,
  }
}
