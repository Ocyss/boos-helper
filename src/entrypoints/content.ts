import type { StorageItemKey } from 'wxt/storage'

import { onMessage } from '@/utils/message'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './main.css'

function genKey(key: string): StorageItemKey {
  const prefixes = ['local:', 'session:', 'sync:', 'managed:']
  return prefixes.some(prefix => key.startsWith(prefix)) ? key as StorageItemKey : `sync:${key}`
}

export default defineContentScript({
  matches: ['*://zhipin.com/*', '*://*.zhipin.com/*'],
  async main(_ctx) {
    console.log('Injecting script...')

    onMessage('storage:get', async ({ key }) => {
      const k = genKey(key)
      const v = await storage.getItem(k)
      return v
    })

    onMessage('storage:set', async ({ key, value }) => {
      try {
        await storage.setItem(genKey(key), value)
        return true
      }
      catch (error) {
        console.error('storage:set', error)
        return false
      }
    })

    await injectScript('/main-world.js', {
      keepInDom: true,
    })

    console.log('Done!')
  },
})
