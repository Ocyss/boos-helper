import { delay } from "@/utils";
import { findEl, getElText } from "@/utils/element";
import axios from "axios";
import { useFormData } from "./useForm";
import {
  PublishError,
  JobTitleError,
  CompanyNameError,
  SalaryError,
  CompanySizeError,
  JobDescriptionError,
  UnknownError,
  errMap,
  RepeatError,
  ActivityError,
  GreetError,
  AIFilteringError,
} from "./types";
import { logData, useLog } from "./useLog";
const { formData, todayData, deliverStop } = useFormData();
import { Message } from "@/pages/web/geek/chat/protobuf";
// @ts-ignore
import { miTem } from "mitem";
import { requestGpt, useModel } from "./useModel";
import { ElMessage } from "element-plus";
import { ref } from "vue";
const { modelData } = useModel();
type handleArgs = {
  el: Element;
  title?: string;
  company?: string;
  card?: JobCard;
};
const total = ref(0);
const current = ref(0);
function getCookieValue(key: string) {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieKey, cookieValue] = cookie.trim().split("=");
    if (cookieKey === key) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
async function sendPublishReq(
  jobTag: Element,
  card?: JobCard,
  errorMsg?: string,
  retries = 3
) {
  if (retries === 0) {
    throw new PublishError(errorMsg || "重试多次失败");
  }
  const url = "https://www.zhipin.com/wapi/zpgeek/friend/add.json";
  let params: {
    securityId: string | null;
    jobId: string | null;
    lid: string | null;
  };
  if (!card) {
    let src = jobTag.querySelector<HTMLLinkElement>(".job-card-left")?.href;
    if (!src) {
      return sendPublishReq(jobTag, card, "未找到元素", retries - 1);
    }
    const urlObj = new URL(src);
    const pathSegments = urlObj.pathname.split("/");
    const jobId = pathSegments[2].replace(".html", "");
    const lid = urlObj.searchParams.get("lid");
    const securityId = urlObj.searchParams.get("securityId");

    params = {
      securityId,
      jobId,
      lid,
    };
  } else {
    params = {
      securityId: card.securityId,
      jobId: card.encryptJobId,
      lid: card.lid,
    };
  }

  try {
    const res = await axios({
      url,
      params,
      method: "POST",
      headers: { Zp_token: getCookieValue("geek_zp_token") },
    });
    if (
      res.data.code === 1 &&
      res.data?.zpData?.bizData?.chatRemindDialog?.content
    ) {
      throw new PublishError(
        res.data?.zpData?.bizData?.chatRemindDialog?.content
      );
    }
    if (res.data.code !== 0) {
      throw new PublishError("状态错误:" + res.data.message);
    }
    return res.data;
  } catch (e: any) {
    if (e instanceof PublishError) {
      throw e;
    }
    return sendPublishReq(jobTag, card, e.message, retries - 1);
  }
}
async function getBossData(
  card: JobCard,
  errorMsg?: string,
  retries = 3
): Promise<BoosData> {
  if (retries === 0) {
    throw new GreetError(errorMsg || "重试多次失败");
  }
  const url = "https://www.zhipin.com/wapi/zpchat/geek/getBossData";
  try {
    const data = new FormData();
    data.append("bossId", card.encryptUserId);
    data.append("securityId", card.securityId);
    data.append("bossSrc", "0");
    const res = await axios<{
      code: number;
      message: string;
      zpData: BoosData;
    }>({
      url,
      data: data,
      method: "POST",
      headers: { Zp_token: getCookieValue("geek_zp_token") },
    });
    if (res.data.code !== 0 && res.data.message !== "非好友关系") {
      throw new GreetError("状态错误:" + res.data.message);
    }
    if (res.data.code !== 0)
      return getBossData(card, "非好友关系", retries - 1);
    return res.data.zpData;
  } catch (e: any) {
    if (e instanceof GreetError) {
      throw e;
    }
    return getBossData(card, e.message, retries - 1);
  }
}

export const useDeliver = () => {
  const log = useLog();
  function rangeMatch(
    rangeStr: string,
    input?: string,
    by = 1
  ): [boolean, string] {
    if (!rangeStr) {
      return [false, "无内容"];
    }
    // 匹配定义范围的正则表达式
    const reg = /(\d+)(?:-(\d+))?/;
    const match = rangeStr.match(reg);
    let err = "预期之外";
    if (match && match.length > 0) {
      err = match[0];
    }
    if (match && input) {
      let start = parseInt(match[1]) * by;
      let end = parseInt(match[2] || match[1]) * by;

      // 如果输入只有一个数字的情况
      if (/^\d+$/.test(input)) {
        let number = parseInt(input);

        return [number >= start && number <= end, err];
      }

      // 如果输入有两个数字的情况
      let inputReg = /^(\d+)(?:-(\d+))?/;
      let inputMatch = input.match(inputReg);
      if (inputMatch) {
        let inputStart = parseInt(inputMatch[1]);
        let inputEnd = parseInt(inputMatch[2] || inputMatch[1]);
        return [
          (start >= inputStart && start <= inputEnd) ||
            (end >= inputStart && end <= inputEnd),
          err,
        ];
      }
    }

    // 其他情况均视为不匹配
    return [false, err];
  }

  function createHandle(): {
    before: (args: handleArgs, ctx: logData) => Promise<void>;
    after: (args: handleArgs, ctx: logData) => Promise<void>;
  } {
    // 无需调用接口
    const handles: Array<(args: handleArgs, ctx: logData) => Promise<void>> =
      [];
    // 需要调用接口
    const handlesRes: Array<(args: handleArgs, ctx: logData) => Promise<void>> =
      [];
    const handlesAfter: Array<
      (args: handleArgs, ctx: logData) => Promise<void>
    > = [];

    // 已沟通过滤
    handles.push(async ({ el }) => {
      try {
        const text = getElText(".start-chat-btn", el);
        if (!text) throw new Error("沟通按钮为空");
        if (!text.includes("立即沟通"))
          throw new RepeatError(`已经沟通过,按钮状态为 [${text}]`);
      } catch (e: any) {
        todayData.repeat++;
        throw new RepeatError(e.message);
      }
    });
    // 岗位名筛选
    if (formData.jobTitle.enable) {
      handles.push(async ({ el, title }, ctx) => {
        try {
          const text = title || getElText(".job-title .job-name", el);
          if (!text) throw new Error("岗位名为空");
          ctx.jobName = text;
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
    }
    // 公司名筛选
    if (formData.company.enable) {
      handles.push(async ({ el, company }, ctx) => {
        try {
          const text =
            company || getElText(".job-card-right .company-name a", el);
          if (!text) throw new Error("公司名为空");
          ctx.companyName = company;
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
          throw new CompanyNameError(e.message);
        }
      });
    }
    // 薪资筛选
    if (formData.salaryRange.enable) {
      handles.push(async ({ el }, ctx) => {
        try {
          const text = getElText(".job-info .salary", el);
          ctx.salary = text;
          const [v, e] = rangeMatch(text, formData.salaryRange.value);
          if (!v)
            throw new SalaryError(
              `不匹配的薪资范围 [${e}],预期: ${formData.salaryRange.value}`
            );
        } catch (e: any) {
          todayData.salaryRange++;
          throw new SalaryError(e.message);
        }
      });
    }
    // 公司规模筛选
    if (formData.companySizeRange.enable) {
      handles.push(async ({ el }, ctx) => {
        try {
          const text = getElText(
            ".job-card-right .company-tag-list", // li:last-child
            el
          );
          ctx.companySize = text;
          const [v, e] = rangeMatch(text, formData.companySizeRange.value);
          if (!v)
            throw new CompanySizeError(
              `不匹配的公司规模 [${e}], 预期: ${formData.companySizeRange.value}`
            );
        } catch (e: any) {
          todayData.companySizeRange++;
          throw new CompanySizeError(e.message);
        }
      });
    }
    // 工作内容筛选
    if (formData.jobContent.enable || formData.aiFiltering.enable) {
      handlesRes.push(async ({ card }) => {
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
    }
    // AI过滤
    if (formData.aiFiltering.enable) {
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
      handlesRes.push(async ({ card }, ctx) => {
        try {
          const msg = template({ card: card });
          if (!model) {
            ElMessage.warning("没有找到AI筛选的模型");
            return;
          }
          const gptMsg = await requestGpt(model, msg);
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
    }
    if (formData.activityFilter) {
      // 活跃度过滤
      handlesRes.push(async ({ card }) => {
        try {
          const activeText = card?.activeTimeDesc;
          if (
            !activeText ||
            activeText.includes("月") ||
            activeText.includes("年")
          )
            throw new ActivityError(`不活跃,当前活跃度 [${activeText}]`);
        } catch (e: any) {
          todayData.activityFilter++;
          throw new ActivityError(e.message);
        }
      });
    }
    // 自定义招呼语
    if (formData.customGreeting.enable || formData.aiGreeting.enable) {
      const template = miTem.compile(
        formData.aiGreeting.enable
          ? formData.aiGreeting.word
          : formData.customGreeting.value
      );
      const model = formData.aiGreeting.enable
        ? modelData.value.find((v) => v.key === formData.aiGreeting.model)
        : undefined;
      handlesAfter.push(async (args: handleArgs, ctx) => {
        try {
          const boosData = await getBossData(args.card!);
          let msg = formData.customGreeting.value;
          if (
            (formData.greetingVariable.value || formData.aiGreeting.enable) &&
            args.card
          ) {
            msg = template({ card: args.card });
          }
          if (formData.aiGreeting.enable) {
            if (!model) {
              ElMessage.warning("没有找到招呼语的模型");
              return;
            }
            const gptMsg = await requestGpt(model, msg);
            if (gptMsg) {
              msg = gptMsg;
            } else {
              return;
            }
          }
          const buf = new Message({
            form_uid: window._PAGE.uid.toString(),
            to_uid: boosData.data.bossId.toString(),
            to_name: boosData.data.encryptBossId, // encryptUserId
            content: msg,
          });
          ctx.message = msg;
          console.log("send", buf.hex, buf.toArrayBuffer());
          window.ChatWebsocket.send(buf); // 不用手动构造mqtt真爽
        } catch (e: any) {
          throw new GreetError(e?.message);
        }
      });
    }
    return {
      before: async (args, ctx) => {
        try {
          await Promise.all(handles.map((handle) => handle(args, ctx)));
          if (handlesRes.length > 0) {
            const params = args.el
              .querySelector<HTMLLinkElement>(".job-card-left")
              ?.href.split("?")[1];

            const res = await axios.get<{
              code: number;
              message: string;
              zpData: {
                jobCard: JobCard;
              };
            }>("https://www.zhipin.com/wapi/zpgeek/job/card.json?" + params, {
              timeout: 5000,
            });
            if (res.data.code == 0) {
              args.card = res.data.zpData.jobCard;
              ctx = {
                ...ctx,
                jobName: args.card.jobName,
                companyName: args.card.brandName,
                salary: args.card.salaryDesc,
                experience: args.card.experienceName,
                degree: args.card.degreeName,
                jobLabels: args.card.jobLabels,
                address: args.card.address,
                card: args.card,
              };
              await Promise.all(handlesRes.map((handle) => handle(args, ctx)));
            } else {
              throw new UnknownError("请求响应错误:" + res.data.message);
            }
          }
        } catch (e: any) {
          if (errMap.has(e.name)) {
            throw e;
          }
          throw new UnknownError("预期外:" + e.message);
        }
      },
      after: async (args, ctx) => {
        if (handlesAfter.length === 0) return;
        try {
          if (!args.card) {
            const params = args.el
              .querySelector<HTMLLinkElement>(".job-card-left")
              ?.href.split("?")[1];
            const res = await axios.get<{
              code: number;
              message: string;
              zpData: {
                jobCard: JobCard;
              };
            }>("https://www.zhipin.com/wapi/zpgeek/job/card.json?" + params, {
              timeout: 5000,
            });
            if (res.data.code == 0) {
              args.card = res.data.zpData.jobCard;
            } else {
              throw new UnknownError("请求响应错误:" + res.data.message);
            }
          }
          await Promise.all(handlesAfter.map((handle) => handle(args, ctx)));
        } catch (e: any) {
          if (errMap.has(e.name)) {
            throw e;
          }
          throw new UnknownError("预期外:" + e.message);
        }
      },
    };
  }

  async function jobListHandle(jobList: NodeListOf<Element>) {
    log.info("获取岗位", `本次获取到 ${jobList.length} 个`);
    total.value = jobList.length;
    jobList.forEach((job) => job.setAttribute("state", "wait"));
    const h = createHandle();
    for (let i = jobList.length - 1; i >= 0; i--) {
      current.value = Number(i);
      if (deliverStop.value) {
        log.info("暂停投递", `剩余 ${i} 个未处理`);
        return;
      }
      try {
        jobList[i].setAttribute("state", "handle");
        const title = getElText(".job-title .job-name", jobList[i]);
        const company = getElText(
          ".job-card-right .company-name a",
          jobList[i]
        );
        const ctx: logData = {};
        try {
          await h.before({ el: jobList[i], title, company }, ctx);
          await sendPublishReq(jobList[i], ctx.card);
          await h.after(
            { el: jobList[i], title, company, card: ctx.card },
            ctx
          );
          log.add(title, null, ctx, ctx.message);
          todayData.success++;
          jobList[i].setAttribute("state", "success");
        } catch (e: any) {
          jobList[i].setAttribute(
            "state",
            e.state === "danger" ? "error" : "warn"
          );
          log.add(title, e, ctx);
        }
      } catch (e) {
        if (jobList[i]) jobList[i].setAttribute("state", "error");
        console.log("未知报错", e, jobList[i]);
      } finally {
        todayData.total++;
        await delay(2000);
      }
    }
  }
  return {
    createHandle,
    jobListHandle,
    rangeMatch,
    sendPublishReq,
    total,
    current,
  };
};
