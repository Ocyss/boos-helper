import { GM_getValue, GM_setValue } from "$";
import { Statistics } from "@/types/formData";
import { getCurDay } from "@/utils";
import { reactiveComputed, watchThrottled } from "@vueuse/core";
import { todayKey, statisticsKey } from "./useConfForm";
import { logger } from "@/utils/logger";

const todayData = reactiveComputed<Statistics>(() => {
  const date = getCurDay();
  const current = {
    date,
    success: 0,
    total: 0,
    company: 0,
    jobTitle: 0,
    jobContent: 0,
    salaryRange: 0,
    companySizeRange: 0,
    activityFilter: 0,
    repeat: 0,
  };
  const g = GM_getValue(todayKey, current);
  logger.debug("统计数据:", g);

  if (g.date === date) {
    return g;
  }
  const statistics = GM_getValue(statisticsKey, []);
  GM_setValue(statisticsKey, [g, ...statistics]);
  GM_setValue(todayKey, current);
  return current;
});

const statisticsData = GM_getValue<Statistics[]>(statisticsKey, []);

watchThrottled(
  todayData,
  (v) => {
    GM_setValue(todayKey, v);
  },
  { throttle: 200 }
);

export const useStatistics = () => {
  return {
    todayData,
    statisticsData,
  };
};
