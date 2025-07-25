import App from '@/App.vue'
import { getRootVue } from '@/composables/useVue'
import { loader } from '@/utils'
import { logger } from '@/utils/logger'
import axios from 'axios'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

async function main(router: any) {
  let module = {
    run() {
      logger.info('BossHelper加载成功')
      logger.warn('当前页面无对应hook脚本', router.path)
    },
  }
  switch (router.path) {
    case '/web/geek/job':
    case '/web/geek/job-recommend':
    case '/web/geek/jobs':
      module = await import('@/pages/zhipin')
      break
  }
  module.run()
  const helper = document.querySelector('#boss-helper')
  if (!helper) {
    // eslint-disable-next-line ts/no-unsafe-argument
    const app = createApp(App)
    app.use(createPinia())
    const appEl = document.createElement('div')
    appEl.id = 'boss-helper'
    document.body.append(appEl)
    app.mount(appEl)
  }
}

async function start() {
//   document.documentElement.classList.toggle(
//     "dark",
//     GM_getValue("theme-dark", false)
//   );

  const v = await getRootVue()
  // eslint-disable-next-line ts/no-unsafe-call
  v.$router.afterHooks.push(main)
  void main(v.$route)
  let axiosLoad: () => void
  axios.interceptors.request.use(
    (config) => {
      if (config.timeout != null) {
        axiosLoad = loader({ ms: config.timeout, color: '#F79E63' })
      }
      return config
    },
    async (error) => {
      axiosLoad()
      return Promise.reject(error)
    },
  )
  axios.interceptors.response.use(
    (response) => {
      axiosLoad()
      return response
    },
    async (error) => {
      axiosLoad()
      return Promise.reject(error)
    },
  )
}

export default defineUnlistedScript(() => {
  start().catch((e) => {
    logger.error(e)
  })
})
