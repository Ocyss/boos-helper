import type { Ref } from 'vue'
import { ref } from 'vue'

const rootVue = ref()

export async function getRootVue() {
  if (rootVue.value)
    return rootVue.value

  const waitVueMount = () => {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver((mutations, obs) => {
        const wrap = document.querySelector('#wrap')
        if (wrap && '__vue__' in wrap) {
          obs.disconnect()
          rootVue.value = wrap.__vue__
          resolve(rootVue.value)
        }
      })

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })

      // 5秒后超时
      setTimeout(() => {
        observer.disconnect()
        reject(new Error('未找到vue根组件'))
      }, 5000)
    })
  }

  await waitVueMount()
  return rootVue.value
}

export function useHookVueData(selectors: string, key: string, data: Ref<any>) {
  return () => {
    const jobVue = document.querySelector<any>(selectors).__vue__
    data.value = jobVue[key]
    // eslint-disable-next-line no-restricted-properties
    const originalSet = jobVue.__lookupSetter__(key)
    // eslint-disable-next-line accessor-pairs
    Object.defineProperty(jobVue, key, {
      set(val) {
        data.value = val
        originalSet.call(this, val)
      },
    })
  }
}
export function useHookVueFn(selectors: string, key: string) {
  return () => {
    const jobVue = document.querySelector<any>(selectors).__vue__
    return jobVue[key]
  }
}
