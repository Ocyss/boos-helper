import App from '@/components/App.vue'
import { getRootVue } from '@/hooks/useVue'
import { loader } from '@/utils'
import { logger } from '@/utils/logger'
import axios from 'axios'
import { createApp } from 'vue'

async function main(router: any) {
  let module = {
    run() {
      logger.info('BoosHelper加载成功')
      logger.warn('当前页面无对应hook脚本', router.path)
    },
  }
  switch (router.path) {
    case '/web/geek/job':
      module = await import('@/pages/zhipin')
      break
  }
  module.run()
  const helper = document.querySelector('#boos-helper')
  if (!helper) {
    const app = createApp(App)
    const appEl = document.createElement('div')
    appEl.id = 'boos-helper'
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
  v.$router.afterHooks.push(main)
  main(v.$route)
  let axiosLoad: () => void
  axios.interceptors.request.use(
    (config) => {
      if (config.timeout) {
        axiosLoad = loader({ ms: config.timeout, color: '#F79E63' })
      }
      return config
    },
    (error) => {
      if (axiosLoad)
        axiosLoad()
      return Promise.reject(error)
    },
  )
  axios.interceptors.response.use(
    (response) => {
      if (axiosLoad)
        axiosLoad()
      return response
    },
    (error) => {
      if (axiosLoad)
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
