import { useHookVueData, useHookVueFn } from "@/hooks/useVue";
import { ref } from "vue";

const page = ref({ page: 1, pageSize: 30 });
const pageChange = ref((v: number) => {});

const initPage = useHookVueData("#wrap .page-job-wrapper", "pageVo", page);
const initChange = useHookVueFn("#wrap .page-job-wrapper", "pageChangeAction");

const next = () => {
  if (page.value.page >= 10) return;
  pageChange.value(page.value.page + 1);
};
const prev = () => {
  if (page.value.page <= 1) return;
  pageChange.value(page.value.page - 1);
};

export const usePager = () => {
  return {
    page,
    pageChange,
    next,
    prev,
    initPager: () => {
      initPage();
      pageChange.value = initChange();
    },
  };
};
