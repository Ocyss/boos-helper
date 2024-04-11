import { getElText } from "@/utils/element";

import { useStatistics } from "@/hooks/useStatistics";
import { handleCFn } from "./type";
import { useConfFormData } from "../useConfForm";
import { ElMessage } from "element-plus";
import { Message } from "../useWebSocket";
// @ts-ignore
import { miTem } from "mitem";
import { useModel } from "../useModel";
import { requestBossData } from "./api";
import {
  RepeatError,
  JobTitleError,
  CompanyNameError,
  SalaryError,
  CompanySizeError,
  JobDescriptionError,
  AIFilteringError,
  ActivityError,
  GreetError,
} from "@/types/deliverError";
import { useStore } from "../useStore";

const { modelData, requestGpt } = useModel();
const { formData } = useConfFormData();
const { todayData } = useStatistics();
const { userInfo } = useStore();
export const communicated: handleCFn = (h) => {
  //   h.push(async ({ data }) => {
  //     try {
  //       const text = getElText(".start-chat-btn", el);
  //       if (!text) throw new Error("沟通按钮为空");
  //       if (!text.includes("立即沟通"))
  //         throw new RepeatError(`已经沟通过,按钮状态为 [${text}]`);
  //     } catch (e: any) {
  //       todayData.repeat++;
  //       throw new RepeatError(e.message);
  //     }
  //   }
  // )
};
export const jobTitle: handleCFn = (h) =>
  h.push(async ({ data }, ctx) => {
    try {
      const text = data.jobName;
      if (!text) throw new Error("岗位名为空");
      for (const x of formData.jobTitle.value) {
        if (text.includes(x)) {
          if (formData.jobTitle.include) {
            return;
          }
          throw new JobTitleError(`岗位名含有排除关键词 [${x}]`);
        }
      }
      if (formData.jobTitle.include) {
        throw new JobTitleError("岗位名不包含关键词");
      }
    } catch (e: any) {
      todayData.jobTitle++;
      throw new e.JobTitleError(e.message);
    }
  });

export const company: handleCFn = (h) =>
  h.push(async ({ data }, ctx) => {
    try {
      const text = data.brandName;
      if (!text) throw new Error("公司名为空");

      for (const x of formData.jobTitle.value) {
        if (text.includes(x)) {
          if (formData.jobTitle.include) {
            return;
          }
          throw new CompanyNameError(`公司名含有排除关键词 [${x}]`);
        }
      }
      if (formData.jobTitle.include) {
        throw new CompanyNameError("公司名不包含关键词");
      }
    } catch (e: any) {
      todayData.company++;
      throw new e.CompanyNameError(e.message);
    }
  });
export const salaryRange: handleCFn = (h) =>
  h.push(async ({ data }, ctx) => {
    try {
      const text = data.salaryDesc;

      const [v, err] = rangeMatch(text, formData.salaryRange.value);
      if (!v)
        throw new SalaryError(
          `不匹配的薪资范围 [${err}],预期: ${formData.salaryRange.value}`
        );
    } catch (e: any) {
      todayData.salaryRange++;
      throw new SalaryError(e.message);
    }
  });
export const companySizeRange: handleCFn = (h) =>
  h.push(async ({ data }, ctx) => {
    try {
      const text = data.brandScaleName;

      const [v, err] = rangeMatch(text, formData.companySizeRange.value);
      if (!v)
        throw new CompanySizeError(
          `不匹配的公司规模 [${err}], 预期: ${formData.companySizeRange.value}`
        );
    } catch (e: any) {
      todayData.companySizeRange++;
      throw new CompanySizeError(e.message);
    }
  });
export const jobContent: handleCFn = (h) =>
  h.push(async ({}, { card }) => {
    try {
      const content = card?.postDescription;
      for (const x of formData.jobContent.value) {
        if (!x) {
          continue;
        }
        let re = new RegExp(
          "(?<!(不|无).{0,5})" + x + "(?!系统|软件|工具|服务)"
        );
        if (content && re.test(content)) {
          if (formData.jobContent.include) {
            return;
          }
          throw new JobDescriptionError(`工作内容含有排除关键词 [${x}]`);
        }
      }
      if (formData.jobContent.include) {
        throw new JobDescriptionError("工作内容中不包含关键词");
      }
    } catch (e: any) {
      todayData.jobContent++;
      throw new JobDescriptionError(e.message);
    }
  });
export const aiFiltering: handleCFn = (h) => {
  const template =
    miTem.compile(`我现在需要求职，让你根据我的需要对岗位进行评分，方便我筛选岗位。
我的要求是:
${formData.aiFiltering.word}
>>>下面是岗位相关信息:
岗位名:{{ card.jobName }}
岗位描述:{{ card.postDescription }}
薪酬:{{ card.salaryDesc }}
经验要求:{{ card.experienceName }},学历要求:{{ card.degreeName }}
相关标签:{{ card.jobLabels }}
>>>>>>>>>>我需要你输出Json格式的字符串，符合以下的定义
interface aiFiltering {
  rating: number; // 分数，0-100分，低于60的我会筛选掉
  negative: string[] | string; // 扣分项，可以是一句话为什么扣分，也可以是数组代表多个扣分项
  positive: string[] | string; // 加分项，可以是一句话为什么加分，也可以是数组代表多个加分项
}`);

  const model = modelData.value.find(
    (v) => v.key === formData.aiGreeting.model
  );
  h.push(async ({}, ctx) => {
    try {
      const msg = template({ card: ctx.card });
      if (!model) {
        ElMessage.warning("没有找到AI筛选的模型");
        return;
      }
      const gptMsg = await requestGpt(model, msg, { json: true });
      if (!gptMsg) {
        return;
      }
      const data: {
        rating: number;
        negative: string[] | string;
        positive: string[] | string;
      } = JSON.parse(gptMsg);
      const mg = `分数${data.rating}\n消极：${data.negative}\n积极：${data.positive}`;
      ctx.aiFiltering = mg;
      if (data.rating < 60) {
        throw new AIFilteringError(mg);
      }
    } catch (e: any) {
      todayData.jobContent++;
      throw new AIFilteringError(e.message);
    }
  });
};
export const activityFilter: handleCFn = (h) =>
  h.push(async ({}, { card }) => {
    try {
      const activeText = card?.activeTimeDesc;
      if (!activeText || activeText.includes("月") || activeText.includes("年"))
        throw new ActivityError(`不活跃,当前活跃度 [${activeText}]`);
    } catch (e: any) {
      todayData.activityFilter++;
      throw new ActivityError(e.message);
    }
  });

export const customGreeting: handleCFn = (h) => {
  const template = miTem.compile(formData.customGreeting.value);
  const uid =
    userInfo.value?.userId || window?._PAGE?.uid || window?._PAGE?.userId;
  if (!uid) {
    ElMessage.error("没有获取到uid,请刷新重试");
    throw new GreetError("没有获取到uid");
  }
  h.push(async (args, ctx) => {
    try {
      const boosData = await requestBossData(ctx.card!);
      let msg = formData.customGreeting.value;
      if (formData.greetingVariable.value && ctx.card) {
        msg = template({ card: ctx.card });
      }
      ctx.message = msg;
      const buf = new Message({
        form_uid: uid.toString(),
        to_uid: boosData.data.bossId.toString(),
        to_name: boosData.data.encryptBossId, // encryptUserId
        content: msg,
      });
      buf.send();
    } catch (e: any) {
      throw new GreetError(e?.message);
    }
  });
};
export const aiGreeting: handleCFn = (h) => {
  const template = miTem.compile(formData.aiGreeting.word);
  const model = modelData.value.find(
    (v) => v.key === formData.aiGreeting.model
  );
  const uid =
    userInfo.value?.userId || window?._PAGE?.uid || window?._PAGE?.userId;
  if (!uid) {
    ElMessage.error("没有获取到uid,请刷新重试");
    throw new GreetError("没有获取到uid");
  }
  h.push(async (args, ctx) => {
    try {
      const boosData = await requestBossData(ctx.card!);
      const msg = template({ card: ctx.card });

      if (!model) {
        ElMessage.warning("没有找到招呼语的模型");
        return;
      }
      const gptMsg = await requestGpt(model, msg, {});
      if (!gptMsg) {
        return;
      }

      ctx.message = gptMsg;
      const buf = new Message({
        form_uid: uid.toString(),
        to_uid: boosData.data.bossId.toString(),
        to_name: boosData.data.encryptBossId, // encryptUserId
        content: gptMsg, // !!! 重大失误
      });
      buf.send();
    } catch (e: any) {
      throw new GreetError(e?.message);
    }
  });
};
