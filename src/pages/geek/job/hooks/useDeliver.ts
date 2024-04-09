import { delay } from "@/utils";
import { getElText } from "@/utils/element";
import { logData, useLog } from "@/hooks/useLog";
import { useCommon } from "@/hooks/useCommon";
import { useStatistics } from "@/hooks/useStatistics";
const { todayData } = useStatistics();
const { deliverStop } = useCommon();
import { ref } from "vue";
import { createHandle, sendPublishReq } from "@/hooks/useApplying";

const total = ref(0);
const current = ref(0);
const log = useLog();

async function jobListHandle(jobList: JobList) {
  log.info("获取岗位", `本次获取到 ${jobList.length} 个`);
  total.value = jobList.length;
  const h = createHandle();
  for (let i = jobList.length - 1; i >= 0; i--) {
    current.value = Number(i);
    if (deliverStop.value) {
      log.info("暂停投递", `剩余 ${i} 个未处理`);
      return;
    }
    try {
      const data = jobList[i];

      const ctx: logData = {};
      try {
        await h.before({ data }, ctx);
        await sendPublishReq(data);
        await h.after({ data, card: ctx.card }, ctx);
        log.add(data.jobName, null, ctx, ctx.message);
        todayData.success++;
      } catch (e: any) {
        log.add(data.jobName, e, ctx);
      }
    } catch (e) {
      console.log("未知报错", e, jobList[i]);
    } finally {
      todayData.total++;
      await delay(2000);
    }
  }
}

export const useDeliver = () => {
  return {
    createHandle,
    jobListHandle,
    total,
    current,
  };
};
