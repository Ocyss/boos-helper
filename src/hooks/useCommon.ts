import { ref } from "vue";

const deliverLock = ref(false);
const deliverStop = ref(false);

export const useCommon = () => {
  return {
    deliverLock,
    deliverStop,
  };
};
