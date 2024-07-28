import { useStatistics } from "@/hooks/useStatistics";
import { handleCFn } from "./type";
import { useConfFormData } from "../useConfForm";
import { ElMessage } from "element-plus";
import { Message } from "../useWebSocket";
import { miTem } from "mitem";
import { useModel } from "../useModel";
import { requestBossData } from "./api";
import {
  JobTitleError,
  CompanyNameError,
  SalaryError,
  CompanySizeError,
  JobDescriptionError,
  AIFilteringError,
  ActivityError,
  GreetError,
  GoldHunterError,
  FriendStatusError,
} from "@/types/deliverError";

import { useUserId } from "../useStore";

import { logData } from "../useLog";

import { parseGptJson } from "@/utils/parse";
import { rangeMatch } from "./utils";
import { useChat } from "../useChat";

import { getCurDay, getCurTime } from "@/utils";
const { chatInputInit, chatMessages } = useChat();
const { modelData, getGpt } = useModel();
const { formData } = useConfFormData();
const { todayData } = useStatistics();

export const communicated: handleCFn = (h) => {
  //   h.push(async ({ data }) => {
  //     try {
  //       const text = getElText(".start-chat-btn", el);
  //       if (!text) throw new RepeatError("沟通按钮为空");
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
      if (!text) throw new JobTitleError("岗位名为空");
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
      throw new JobTitleError(e.message);
    }
  });

export const goldHunterFilter: handleCFn = (h) =>
  h.push(async ({ data }, ctx) => {
    if (data?.goldHunter === 1) {
      todayData.goldHunterFilter++;
      throw new GoldHunterError("猎头过滤");
    }
  });

export const company: handleCFn = (h) =>
  h.push(async ({ data }, ctx) => {
    try {
      const text = data.brandName;
      if (!text) throw new CompanyNameError("公司名为空");

      for (const x of formData.company.value) {
        if (text.includes(x)) {
          if (formData.company.include) {
            return;
          }
          throw new CompanyNameError(`公司名含有排除关键词 [${x}]`);
        }
      }
      if (formData.company.include) {
        throw new CompanyNameError("公司名不包含关键词");
      }
    } catch (e: any) {
      todayData.company++;
      throw new CompanyNameError(e.message);
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
  h.push(async (_, { card }) => {
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

export const jobFriendStatus: handleCFn = (h) =>
  h.push(async (_, { card }) => {
    const content = card?.friendStatus;
    if (content && content != 0) {
      throw new FriendStatusError("已经是好友了");
    }
  });
export const aiFiltering: handleCFn = (h) => {
  const model = modelData.value.find(
    (v) => formData.aiFiltering.model === v.key
  );
  if (!model) {
    throw new AIFilteringError("没有找到AI筛选的模型");
  }
  const gpt = getGpt(model, formData.aiFiltering.prompt);
  h.push(async (_, ctx) => {
    const chatInput = chatInputInit(model);
    try {
      const { content, prompt } = await gpt.message({
        data: {
          data: ctx,
          card: ctx.card,
        },
        onStream: chatInput.handle,
        onPrompt: (s) => chatBoosMessage(ctx, s),
      });
      ctx.aiFilteringQ = prompt;
      if (!content) {
        return;
      }
      ctx.aiFilteringAraw = content;
      const data = parseGptJson<{
        rating: number;
        negative: string[] | string;
        positive: string[] | string;
      }>(content);
      ctx.aiFilteringAjson = data || {};
      const mg = `分数${data?.rating}\n消极：${data?.negative}\n积极：${data?.positive}`;
      ctx.aiFilteringAtext = content;
      chatInput.end(mg);
      if (!data || !data.rating || data.rating < 40) {
        throw new AIFilteringError(mg);
      }
    } catch (e: any) {
      todayData.jobContent++;
      throw new AIFilteringError(e.message);
    } finally {
      chatInput.end("Err~");
    }
  });
};
export const activityFilter: handleCFn = (h) =>
  h.push(async (_, { card }) => {
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
  const uid = useUserId();
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
const chatBoosMessage = (ctx: logData, msg: string) => {
  const d = new Date();
  chatMessages.value.push({
    id: d.getTime(),
    role: "boos",
    content: msg,
    date: [getCurDay(d), getCurTime(d)],
    name: ctx.brandName,
    avatar: ctx.brandLogo,
  });
};
export const aiGreeting: handleCFn = (h) => {
  const model = modelData.value.find(
    (v) => formData.aiGreeting.model === v.key
  );
  if (!model) {
    ElMessage.warning("没有找到招呼语的模型");
    return;
  }
  const gpt = getGpt(model, formData.aiGreeting.prompt);
  const uid = useUserId();
  if (!uid) {
    ElMessage.error("没有获取到uid,请刷新重试");
    throw new GreetError("没有获取到uid");
  }
  h.push(async (args, ctx) => {
    const chatInput = chatInputInit(model);
    try {
      const boosData = await requestBossData(ctx.card!);
      const { content, prompt } = await gpt.message({
        data: {
          data: ctx,
          card: ctx.card,
        },
        onStream: chatInput.handle,
        onPrompt: (s) => chatBoosMessage(ctx, s),
      });
      ctx.aiGreetingQ = prompt;
      if (!content) {
        return;
      }
      ctx.message = content;
      ctx.aiGreetingA = content;
      chatInput.end(content);
      const buf = new Message({
        form_uid: uid.toString(),
        to_uid: boosData.data.bossId.toString(),
        to_name: boosData.data.encryptBossId, // encryptUserId
        content,
      });
      buf.send();
    } catch (e: any) {
      throw new GreetError(e?.message);
    } finally {
      chatInput.end("Err~");
    }
  });
};
export const record = async (ctx: logData) => {
  const model = modelData.value.filter((v) =>
    formData.record.model?.includes(v.key)
  );
  // await requestGpt(model, ctx, {});
};
