import type { Statistics } from '@/types/formData'

import { getCurDay } from '@/utils'
import { getStorage, setStorage } from '@/utils/message/storage'
import { reactiveComputed, watchThrottled } from '@vueuse/core'
import { defineStore } from 'pinia'

export const todayKey = 'local:web-geek-job-Today'
export const statisticsKey = 'local:web-geek-job-Statistics'

export const useStatistics = defineStore('statistics', () => {
  const date = getCurDay()

  const todayData = reactiveComputed<Statistics>(() => {
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
      jobAddress: 0,
      amap: 0,
    }
    return current
  })

  const statisticsData = ref<Statistics[]>([])

  async function getStatistics(): Promise<string> {
    await updateStatistics()
    return JSON.stringify(jsonClone({ t: todayData, s: statisticsData.value }))
  }

  async function setStatistics(data: string) {
    const { t, s } = JSON.parse(data)
    deepmerge(todayData, t, { clone: false })
    statisticsData.value = s
    await setStorage(todayKey, t)
    await setStorage(statisticsKey, s)
  }

  watchThrottled(
    todayData,
    (v) => {
      void setStorage(todayKey, jsonClone(v))
    },
    { throttle: 200 },
  )

  async function updateStatistics() {
    const curData = jsonClone(todayData)

    void getStorage<Statistics[]>(statisticsKey, []).then((data) => {
      statisticsData.value = data
    })

    const g = (await getStorage(todayKey, curData))
    logger.debug('统计数据:', date, g)
    if (g.date === date) {
      deepmerge(todayData, g, { clone: false })
      return g
    }

    const statistics = await getStorage(statisticsKey, [])
    const newStatistics = [g, ...statistics]
    await setStorage(statisticsKey, newStatistics)
    await setStorage(todayKey, curData)
    statisticsData.value = newStatistics
  }
  return {
    todayData,
    statisticsData,
    updateStatistics,
    getStatistics,
    setStatistics,
  }
})
