import type { FormData } from '@/types/formData'
import { useUser } from '@/stores/user'

import deepmerge from '@/utils/deepmerge'

import { exportJson, importJson } from '@/utils/jsonImportExport'
import { logger } from '@/utils/logger'
import { getCookieInfo } from '@/utils/message/cookie'

import { getStorage, setStorage } from '@/utils/message/storage'
import { watchThrottled } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { reactive, ref, toRaw } from 'vue'
import { defaultFormData } from './info'

export * from './info'

export const formDataKey = 'local:web-geek-job-FormData'

export const useConf = defineStore('conf', () => {
  const formData: FormData = reactive(defaultFormData)
  const isLoaded = ref(false)

  const FROM_VERSION: [string, (from: Partial<FormData>) => Partial<FormData>][] = [
    ['20250826', (from) => {
      if (from.salaryRange && typeof from.salaryRange.value === 'string') {
        const [min, max] = (from.salaryRange.value as string).split('-').map(Number)
        from.salaryRange.value = [min, max, false]
      }
      if (from.companySizeRange && typeof from.companySizeRange.value === 'string') {
        const [min, max] = (from.companySizeRange.value as string).split('-').map(Number)
        from.companySizeRange.value = [min, max, false]
      }
      return from
    }],
  ]

  async function formDataHandler(from: Partial<FormData>) {
    try {
      for (let i = FROM_VERSION.length - 1; i >= 0; i--) {
        const [version, fn] = FROM_VERSION[i]
        if ((from?.version ?? '20240401') >= version) {
          break
        }
        from = fn(from)
        from.version = version
      }
      const user = useUser()
      const uid = user.getUserId()
      // eslint-disable-next-line eqeqeq
      if (uid != null && from.userId != null && from.userId != uid) {
        const data = await getCookieInfo()
        if (uid in data) {
          await user.changeUser(data[uid])
          ElMessage.success('匹配到账号配置 恢复中, 3s后刷新页面')
          setTimeout(() => window.location.reload(), 3000)
          return
        }
        else {
          ElMessage.success('登录新账号')
          from.userId = uid
        }
      }
      else if (uid != null && from.userId == null) {
        from.userId = uid
      }
    }
    catch (err) {
      logger.error('用户配置初始化失败', err)
      ElMessage.error(`用户配置初始化失败: ${String(err)}`)
    }
    return from
  }

  async function init() {
    let from = await getStorage<Partial<FormData>>(formDataKey, {})
    from = await formDataHandler(from) ?? from
    const data = deepmerge<FormData>(defaultFormData, from)
    Object.assign(formData, data)
    isLoaded.value = true
  }

  watchThrottled(
    formData,
    (v) => {
      logger.debug('formData改变', toRaw(v))
    },
    { throttle: 2000 },
  )

  async function confSaving() {
    const v = jsonClone(formData)
    try {
      await setStorage(formDataKey, v)
      logger.debug('formData保存', v)
      ElMessage.success('保存成功')
    }
    catch (error: any) {
      ElMessage.error(`保存失败: ${error.message}`)
    }
  }

  async function confReload() {
    const v = deepmerge<FormData>(defaultFormData, await getStorage(formDataKey, {}))
    deepmerge(formData, v, { clone: false })
    logger.debug('formData已重置')
    ElMessage.success('重置成功')
  }

  async function confExport() {
    const data = deepmerge<FormData>(
      defaultFormData,
      await getStorage(formDataKey, {}),
    )
    exportJson(data, '打招呼配置')
  }

  async function confImport() {
    let jsonData = await importJson<Partial<FormData>>()

    jsonData.userId = undefined
    jsonData = await formDataHandler(jsonData) ?? jsonData
    // await setStorage(formDataKey, jsonData)
    deepmerge(formData, jsonData, { clone: false })
    ElMessage.success('导入成功, 切记要手动保存哦')
  }

  function confDelete() {
    deepmerge(formData, defaultFormData, { clone: false })
    logger.debug('formData已清空')
    ElMessage.success('清空成功')
  }

  return {
    confInit: init,
    confSaving,
    confReload,
    confExport,
    confImport,
    confDelete,
    formDataKey,
    defaultFormData,
    formData,
    isLoaded,
  }
})

window.__q_useConf = useConf
