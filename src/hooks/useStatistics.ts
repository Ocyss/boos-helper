import type { Statistics } from '@/types/formData'
import { getCurDay } from '@/utils'
import { getStorage, setStorage } from '@/utils/storage'
import { reactiveComputed, watchThrottled } from '@vueuse/core'
import { statisticsKey, todayKey } from './useConfForm'

const todayData = reactiveComputed<Statistics>(() => {
  const date = getCurDay()
  const current = {
    date,
    success: 0,
    total: 0,
    company: 0,
    jobTitle: 0,
    jobContent: 0,
    hrPosition: 0,
    salaryRange: 0,
    companySizeRange: 0,
    activityFilter: 0,
    goldHunterFilter: 0,
    repeat: 0,
  }
  // TODO
  //   const g = (await storage.getItem<typeof current>(todayKey))??current;
  // logger.debug("统计数据:", g);

  // if (g.date === date) {
  //   return g;
  // }
  // const statistics = await storage.getItem<typeof current[]>(statisticsKey,{fallback:[]});
  // await storage.setItem(statisticsKey, [g, ...statistics]);
  // await storage.setItem(todayKey, current);
  return current
})

let statisticsData: Statistics[] = []

getStorage<Statistics[]>(statisticsKey, []).then(data => statisticsData = data)

watchThrottled(
  todayData,
  (v) => {
    setStorage(todayKey, v)
  },
  { throttle: 200 },
)

export function useStatistics() {
  return {
    todayData,
    statisticsData,
  }
}
