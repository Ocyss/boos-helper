import { delay } from "@/utils";
import { logData, useLog } from "@/hooks/useLog";
import { useCommon } from "@/hooks/useCommon";
import { useStatistics } from "@/hooks/useStatistics";
const { todayData } = useStatistics();
const { deliverStop } = useCommon();
import { ref } from "vue";
import { createHandle, sendPublishReq } from "@/hooks/useApplying";
import { Actions } from "@/hooks/useMap";

const total = ref(0);
const current = ref(0);
const log = useLog();

async function jobListHandle(
  jobList: JobList,
  jobMap: Actions<
    string,
    {
      state: string;
      msg: string;
    }
  >
) {
  log.info("获取岗位", `本次获取到 ${jobList.length} 个`);
  total.value = jobList.length;
  const h = createHandle();
  jobList.forEach((v) => {
    jobMap.set(v.encryptJobId, {
      state: "wait",
      msg: "等待中",
    });
  });
  for (let i in jobList) {
    current.value = Number(i);
    if (deliverStop.value) {
      log.info("暂停投递", `剩余 ${i} 个未处理`);
      return;
    }
    try {
      const data = jobList[i];
      jobMap.set(data.encryptJobId, {
        state: "running",
        msg: "处理中",
      });
      const ctx: logData = {};
      try {
        await h.before({ data }, ctx);
        await sendPublishReq(data);
        await h.after({ data, card: ctx.card }, ctx);
        log.add(data.jobName, null, ctx, ctx.message);
        todayData.success++;
        jobMap.set(data.encryptJobId, {
          state: "success",
          msg: "投递成功",
        });
      } catch (e: any) {
        jobMap.set(data.encryptJobId, {
          state: e.state === "warning" ? "warn" : "error",
          msg: e.name || "没有消息",
        });
        log.add(data.jobName, e, ctx);
      }
    } catch (e) {
      jobMap.set(jobList[i].encryptJobId, {
        state: "error",
        msg: "未知报错",
      });
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
