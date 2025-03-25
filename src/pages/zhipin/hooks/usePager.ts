import { useHookVueData, useHookVueFn } from '@/hooks/useVue'
import { ref } from 'vue'

const page = ref({ page: 1, pageSize: 30 })
const pageChange = ref((_v: number) => {})

const initPage = useHookVueData('#wrap .page-job-wrapper,.job-recommend-main', 'pageVo', page)

const initChange = useHookVueFn('#wrap .page-job-wrapper', 'pageChangeAction')
const initSearch = useHookVueFn('#wrap .page-job-wrapper,.job-recommend-main', 'searchJobAction')

function next() {
  if (page.value.page >= 10) {
    return false
  }
  pageChange.value(page.value.page + 1)
  return true
}

function prev() {
  if (page.value.page <= 1) {
    return false
  }
  pageChange.value(page.value.page - 1)
  return true
}

export function usePager() {
  return {
    page,
    pageChange,
    next,
    prev,
    initPager: async () => {
      await initPage()
      pageChange.value = location.href.includes('/web/geek/job-recommend')
        ? (await initSearch())
        : (await initChange())
    },
  }
}
