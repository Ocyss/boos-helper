import { ref } from 'vue'

const deliverLock = ref(false)
const deliverStop = ref(false)

export function useCommon() {
  return {
    deliverLock,
    deliverStop,
  }
}
