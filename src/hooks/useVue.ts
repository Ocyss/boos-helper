import { Ref } from "vue";

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
