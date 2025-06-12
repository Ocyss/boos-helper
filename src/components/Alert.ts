import type { AlertProps } from 'element-plus'
import { getStorage, setStorage } from '@/utils/message/storage'
import { alertProps, ElAlert } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

export interface ExtendedAlertProps extends AlertProps {
  id: string
}

export default defineComponent({
  name: 'Alert',
  props: {
    ...alertProps,
    id: {
      type: String,
      required: true,
    },
  },
  setup(props: ExtendedAlertProps, { slots }): () => VNode | null {
    const storageKey = computed(() => `local:alert:${props.id}`)
    const isVisible = ref(true)

    onMounted(async () => {
      const shouldHide = await getStorage(storageKey.value, false)
      isVisible.value = !shouldHide
    })

    const handleClose = async () => {
      await setStorage(storageKey.value, true)
      isVisible.value = false
    }

    return () => isVisible.value
      ? h(ElAlert, {
          ...props,
          onClose: handleClose,
        }, slots)
      : null
  },
})
