import { ref, Ref } from "vue";

const rootVue = ref();

export const getRootVue = async () => {
  if (rootVue.value) return rootVue.value;

  const waitVueMount = () => {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver((mutations, obs) => {
        const wrap = document.querySelector('#wrap');
        if (wrap && '__vue__' in wrap) {
          obs.disconnect();
          rootVue.value = wrap.__vue__;
          resolve(rootVue.value);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      // 5秒后超时
      setTimeout(() => {
        observer.disconnect();
        reject(new Error("未找到vue根组件"));
      }, 5000);
    });
  };


  try {
    await waitVueMount();
    return rootVue.value;
  } catch (err) {
    throw err;
  }
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
