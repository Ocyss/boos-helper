import { logger } from '@/utils/logger'
import { ref } from 'vue'
import { getRootVue } from './useVue'

const userInfo = ref<{
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

async function storeInit() {
  const v = await getRootVue()
  const store = v?.$store?.state
  userInfo.value = store?.userInfo
  logger.debug('userInfo: ', userInfo.value)
}

export function useStore() {
  return {
    storeInit,
    userInfo,
  }
}
export function useUserId() {
  return (
    userInfo.value?.userId
    || window?._PAGE?.uid
    || window?._PAGE?.userId
  )
}
