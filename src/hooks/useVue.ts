import { delay } from "@/utils";
import { ElMessage } from "element-plus";
import { ref, Ref } from "vue";

const rootVue = ref();

export const getRootVue = async () => {
  if (rootVue.value) return rootVue.value;
  let wrap;
  while (!wrap) {
    await delay(100);
    wrap = document.querySelector<Element & { __vue__: any }>("#wrap");
  }
  if (wrap.__vue__) rootVue.value = wrap.__vue__;
  else {
    ElMessage.error("未找到vue根组件");
    throw new Error("未找到vue根组件");
  }
  return rootVue.value;
};
export const useHookVueData = (
  selectors: string,
  key: string,
  data: Ref<any>
) => {
  return () => {
    const jobVue = document.querySelector<any>(selectors).__vue__;
    data.value = jobVue[key];
    let originalSet = jobVue.__lookupSetter__(key);
    Object.defineProperty(jobVue, key, {
      set(val) {
        data.value = val;
        originalSet.call(this, val);
      },
    });
  };
};
export const useHookVueFn = (selectors: string, key: string) => {
  return () => {
    const jobVue = document.querySelector<any>(selectors).__vue__;
    return jobVue[key];
  };
};
