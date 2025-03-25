import type { Ref } from 'vue'
import { ref } from 'vue'

const rootVue = ref()

export async function getRootVue(): Promise<any> {
  if (rootVue.value !== undefined) {
    return rootVue.value
  }

  const waitVueMount = async () => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const wrap = document.querySelector('#wrap')
        if (rootVue.value !== undefined) {
          return resolve(rootVue.value)
        }
        if (wrap && '__vue__' in wrap) {
          rootVue.value = wrap.__vue__
          resolve(rootVue.value)
          clearInterval(interval)
        }
      }, 300)
      setTimeout(() => {
        reject(new Error('未找到vue根组件'))
        clearInterval(interval)
      }, 20000)
    })
  }

  await waitVueMount()
  return rootVue.value
}

export function useHookVueData<T = any>(selectors: string, key: string, data: Ref<T>, update?: (val: T) => void) {
  return async () => {
    const jobVue = await new Promise<any>((resolve, reject) => {
      const interval = setInterval(() => {
        const jobVue = document.querySelector<any>(selectors)?.__vue__
        if (jobVue) {
          resolve(jobVue)
          clearInterval(interval)
        }
      }, 100)
      setTimeout(() => {
        reject(new Error('未找到对应元素'))
        clearInterval(interval)
      }, 20000)
    })

    data.value = jobVue[key]
    update?.(toValue(jobVue[key] as T))
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
  return async () => {
    const jobVue = await new Promise<any>((resolve, reject) => {
      const interval = setInterval(() => {
        const jobVue = document.querySelector<any>(selectors)?.__vue__
        if (jobVue) {
          resolve(jobVue)
          clearInterval(interval)
        }
      }, 100)
      setTimeout(() => {
        reject(new Error('未找到对应元素'))
        clearInterval(interval)
      }, 20000)
    })
    return jobVue[key]
  }
}
