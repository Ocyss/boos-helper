import { delay } from "@/utils";
import { logData, useLog } from "@/hooks/useLog";
import { useCommon } from "@/hooks/useCommon";
import { useStatistics } from "@/hooks/useStatistics";

import { ref } from "vue";
import { createHandle, sendPublishReq } from "@/hooks/useApplying";
import { Actions } from "@/hooks/useMap";
import { logger } from "@/utils/logger";
import { useConfFormData } from "@/hooks/useConfForm";

const total = ref(0);
const current = ref(0);
const log = useLog();
const { todayData } = useStatistics();
const { deliverStop } = useCommon();
const { formData } = useConfFormData();
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
    if (!jobMap.has(v.encryptJobId))
      jobMap.set(v.encryptJobId, {
        state: "wait",
        msg: "等待中",
      });
  });
  for (const [index, data] of jobList.entries()) {
    current.value = index;
    if (deliverStop.value) {
      log.info("暂停投递", `剩余 ${jobList.length - index} 个未处理`);
      return;
    }
    if (jobMap.get(data.encryptJobId)?.state !== "wait") continue;

    try {
      jobMap.set(data.encryptJobId, {
        state: "running",
        msg: "处理中",
      });
      const ctx: logData = JSON.parse(JSON.stringify(data));
      try {
        await h.before({ data }, ctx);
        await sendPublishReq(data);
        await h.after({ data }, ctx);
        log.add(data.jobName, null, ctx, ctx.message);
        todayData.success++;
        jobMap.set(data.encryptJobId, {
          state: "success",
          msg: "投递成功",
        });
        logger.warn("成功", ctx);
        ctx.state = "成功";
      } catch (e: any) {
        jobMap.set(data.encryptJobId, {
          state: e.state === "warning" ? "warn" : "error",
          msg: e.name || "没有消息",
        });
        log.add(data.jobName, e, ctx);
        logger.warn("过滤", ctx);
        ctx.state = "过滤";
        ctx.err = e.message || "";
      } finally {
        await h.record(ctx);
      }
    } catch (e) {
      jobMap.set(data.encryptJobId, {
        state: "error",
        msg: "未知报错",
      });
      logger.error("未知报错", e, data);
    } finally {
      todayData.total++;
      await delay(formData.delay.deliveryInterval);
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
