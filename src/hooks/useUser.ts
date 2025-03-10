import type { CookieInfo } from '@/utils/message/cookie'
import { logger } from '@/utils/logger'
import { clearCookie, deleteCookie, getCookieInfo, saveCookie, switchCookie } from '@/utils/message/cookie'
import { setStorage } from '@/utils/message/storage'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { getRootVue } from './useVue'

export const userInfo = ref<{
  userId: number
  identity: number
  encryptUserId: string
  name: string
  showName: string
  tinyAvatar: string
  largeAvatar: string
  token: string
  isHunter: boolean
  clientIP: string
  email: any
  phone: any
  brandName: any
  doubleIdentity: boolean
  recruit: boolean
  agentRecruit: boolean
  industryCostTag: number
  gender: number
  trueMan: boolean
  studentFlag: boolean
  completeDayStatus: boolean
  complete: boolean
  multiExpect: boolean
}>()

export function getUserId(): number | string | null {
  return userInfo.value?.userId
  ?? window?._PAGE?.uid
  ?? window?._PAGE?.userId
}

export async function userInfoInit() {
  const v = await getRootVue()
  const store = v?.$store?.state
  userInfo.value = store?.userInfo
  logger.debug('userInfo: ', userInfo.value)
}

export function useCookieInfo() {
  const data = ref<Record<string, CookieInfo>>({})

  const tableData = computed(() => Object.values(data.value))

  getCookieInfo().then((res) => {
    res = res ?? {}
    logger.debug('账户数据', res)
    data.value = res
  }).catch((err) => {
    logger.error('获取账户数据失败', err)
    ElMessage.error(`获取账户数据失败: ${err}`)
  })
  return {
    data,
    tableData,
  }
}

export async function createUser({ change = false, uid = getUserId(), clearCk = true }) {
  logger.debug('开始创建账户')
  const { formData } = useConfFormData()

  // 如果不切换账号或者
  // 切换账号但是有uid则创建
  if (!change || uid != null) {
    if (uid == null) {
      throw new Error('找不到uid')
    }
    uid = String(uid)

    const val: CookieInfo = {
      uid,
      user: userInfo.value?.showName ?? userInfo.value?.name ?? '未知用户',
      avatar: userInfo.value?.tinyAvatar ?? userInfo.value?.largeAvatar ?? '',
      remark: '',
      gender: userInfo.value?.gender === 0 ? 'man' : 'woman',
      flag: userInfo.value?.studentFlag ? 'student' : 'staff',
      date: new Date().toLocaleString(),
      form: jsonClone(formData),
      statistics: await getStatistics(),
    }
    await saveCookie(val)
    return val
  }
  if (clearCk) {
    await clearCookie()
  }
}

export async function changeUser(currentRow?: CookieInfo) {
  if (!currentRow) {
    ElMessage.error('请先选择要切换的账号')
    return
  }

  const targetAccount = jsonClone(currentRow)

  // 保存当前账号状态
  await createUser({ change: true })

  // 恢复目标账号的配置
  if (targetAccount.form) {
    await setStorage(formDataKey, targetAccount.form)
  }

  if (targetAccount.statistics != null) {
    await setStatistics(targetAccount.statistics)
  }

  // 切换到目标账号
  await switchCookie(targetAccount.uid)
}

export async function deleteUser(d: CookieInfo) {
  try {
    await deleteCookie(d.uid)
    ElMessage.success('账号删除成功')
  }
  catch (error) {
    logger.error('删除账号失败', error)
    ElMessage.error('删除账号失败，请重试')
  }
}
