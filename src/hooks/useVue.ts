import type { Ref } from 'vue'
import { ref } from 'vue'

const rootVue = ref()

export async function getRootVue(): Promise<any> {
  if (rootVue.value !== undefined) {
    return rootVue.value
  }

  const waitVueMount = async () => {
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

export function useHookVueData<T = any>(selectors: string, key: string, data: Ref<T>, update?: (val: T) => void) {
  return () => {
    const jobVue = document.querySelector<any>(selectors)?.__vue__

    data.value = jobVue[key]
    // eslint-disable-next-line no-restricted-properties, ts/no-unsafe-call
    const originalSet = jobVue.__lookupSetter__(key)
    // eslint-disable-next-line accessor-pairs
    Object.defineProperty(jobVue, key, {
      set(val: T) {
        data.value = val
        update?.(val)
        // eslint-disable-next-line ts/no-unsafe-call
        originalSet.call(this, val)
      },
    })
  }
}

export function useHookVueFn(selectors: string, key: string) {
  return () => {
    const jobVue = document.querySelector<any>(selectors)?.__vue__

    return jobVue[key]
  }
}
