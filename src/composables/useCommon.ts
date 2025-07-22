import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommon = defineStore('common', () => {
  const deliverLock = ref(false)
  const deliverStop = ref(false)
  const appLoading = ref(false)

  return {
    deliverLock,
    deliverStop,
    appLoading,
  }
})
