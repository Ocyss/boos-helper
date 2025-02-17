import type { CookieInfo } from '@/utils/message/cookie'
import type { Cookies } from 'wxt/browser'
import { onBrowserMessage } from '@/utils/message/browser'

const userKey = 'local:conf-user'

type UserConf = Record<string, {
  info: CookieInfo
  cookies: Cookies.Cookie[]
}>

export default defineBackground({
  main() {
    onBrowserMessage('cookie:info', async () => {
      const cookieInfo = await storage.getItem<UserConf>(userKey, { fallback: {} })
      const result: Record<string, CookieInfo> = {}
      Object.entries(cookieInfo).forEach(([uid, v]) => {
        result[uid] = v.info
      })
      return result
    })

    onBrowserMessage('cookie:switch', async ({ uid }) => {
      const userConf = await storage.getItem<UserConf>(userKey, { fallback: {} })
      if (uid in userConf) {
        const cookies = await browser.cookies.getAll({ url: 'https://zhipin.com' })
        await Promise.all(cookies.map(async (cookie) => {
          await browser.cookies.remove({
            url: 'https://zhipin.com',
            name: cookie.name,
          })
        }))

        const targetUser = userConf[uid]

        console.log('切换账号 targetUser', targetUser)

        await Promise.all(targetUser.cookies.map(async (ck) => {
          await browser.cookies.set({
            url: 'https://zhipin.com',
            name: ck.name,
            value: ck.value,
            path: ck.path,
            domain: ck.domain,
            expirationDate: ck.expirationDate,
          })
        }))
      }
      return true
    })

    onBrowserMessage('cookie:save', async ({ info }) => {
      // 直接保存完整的cookie字符串数组
      const cookies = await browser.cookies.getAll({ url: 'https://zhipin.com' })

      const userConf = await storage.getItem<UserConf>(userKey, { fallback: {} })
      userConf[info.uid] = {
        info,
        cookies,
      }
      await storage.setItem(userKey, userConf)
      return true
    })

    onBrowserMessage('cookie:delete', async ({ uid }) => {
      const userConf = await storage.getItem<UserConf>(userKey, { fallback: {} })
      delete userConf[uid]
      await storage.setItem(userKey, userConf)
      return true
    })

    onBrowserMessage('cookie:clear', async () => {
      const cookies = await browser.cookies.getAll({ url: 'https://zhipin.com' })
      await Promise.all(cookies.map(async (cookie) => {
        await browser.cookies.remove({
          url: 'https://zhipin.com',
          name: cookie.name,
        })
      }))
      return true
    })

    onBrowserMessage('request', async (args) => {
      console.log('request', args)
      const signal = AbortSignal.timeout(args.timeout * 1000)
      try {
        const res = await fetch(args.url, { ...args.data, signal, mode: 'cors', credentials: 'include' }).then(async (res) => {
          console.log('request res', res)

          if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`${errorText} | ${res.statusText}`)
          }

          const result
              = args.responseType === 'json'
                ? await res.json()
                : await res.text()

          return result
        })
        return res
      }
      catch (e) {
        console.error('request error', e)
        return e
      }
    })
  },
})
