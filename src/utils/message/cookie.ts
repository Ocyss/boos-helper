import type { FormData } from '@/types/formData'
import { sendMessage } from '@/utils/message'

export interface CookieInfo {
  uid: string
  user: string
  avatar: string
  remark: string
  gender: 'man' | 'woman'
  flag: 'student' | 'staff'
  date: string
  form?: FormData
  statistics?: string
}

// 获取所有账号的 cookie 和用户信息
export async function getCookieInfo(): Promise<Record<string, CookieInfo>> {
  return sendMessage('cookie:info', undefined)
}

// 切换到指定账号 cookie
export async function switchCookie(uid: string): Promise<boolean> {
  return sendMessage('cookie:switch', { uid })
}

// 保存当前账号的 cookie
export async function saveCookie(info: CookieInfo): Promise<boolean> {
  return sendMessage('cookie:save', { info })
}

// 删除指定账号的 cookie
export async function deleteCookie(uid: string): Promise<boolean> {
  return sendMessage('cookie:delete', { uid })
}

// 清空当前账号的 cookie
export async function clearCookie(): Promise<boolean> {
  return sendMessage('cookie:clear', undefined)
}
