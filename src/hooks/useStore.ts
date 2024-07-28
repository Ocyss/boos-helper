import { ref } from "vue";
import { getRootVue, useHookVueData } from "./useVue";
import { logger } from "@/utils/logger";
import { unsafeWindow } from "$";

const userInfo = ref<{
  userId: number;
  identity: number;
  encryptUserId: string;
  name: string;
  showName: string;
  tinyAvatar: string;
  largeAvatar: string;
  token: string;
  isHunter: boolean;
  clientIP: string;
  email: any;
  phone: any;
  brandName: any;
  doubleIdentity: boolean;
  recruit: boolean;
  agentRecruit: boolean;
  industryCostTag: number;
  gender: number;
  trueMan: boolean;
  studentFlag: boolean;
  completeDayStatus: boolean;
  complete: boolean;
  multiExpect: boolean;
}>();

const storeInit = async () => {
  const v = await getRootVue();
  const store = v?.$store?.state;
  userInfo.value = store?.userInfo;
  logger.debug("userInfo: ", userInfo.value);
};

export const useStore = () => {
  return {
    storeInit,
    userInfo,
  };
};
export const useUserId = () => {
  return (
    userInfo.value?.userId ||
    unsafeWindow?._PAGE?.uid ||
    unsafeWindow?._PAGE?.userId
  );
};
