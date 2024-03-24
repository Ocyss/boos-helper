import { delay } from "@/utils";
import { findEl, getElText } from "@/utils/element";
import axios from "axios";
import { useFormData } from "./form";
import {
  PublishError,
  JobTitleError,
  CompanyNameError,
  SalaryError,
  CompanySizeError,
  JobDescriptionError,
  UnknownError,
  errMap,
} from "./types";
const { formData, deliverLock, deliverStop } = useFormData();

type handleArgs = {
  el: Element;
  title?: string;
  company?: string;
  card?: JobCard;
};

function queryString(
  baseURL: string,
  queryParams: {
    securityId: string | null;
    jobId: string;
    lid: string | null;
  }
) {
  const queryString = Object.entries(queryParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value ?? 0)}`
    )
    .join("&");

  return `${baseURL}?${queryString}`;
}

function parseURL(url: string) {
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split("/");
  const jobId = pathSegments[2].replace(".html", "");
  const lid = urlObj.searchParams.get("lid");
  const securityId = urlObj.searchParams.get("securityId");

  return {
    securityId,
    jobId,
    lid,
  };
}

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
async function sendPublishReq(jobTag: Element, errorMsg?: string, retries = 3) {
  if (retries === 0) {
    throw new PublishError(errorMsg || "重试多次失败");
  }

  let src = jobTag.querySelector<HTMLLinkElement>(".job-card-left")?.href;
  if (!src) {
    return sendPublishReq(jobTag, "未找到元素", retries - 1);
  }
  let paramObj = parseURL(src);
  let url = queryString(
    "https://www.zhipin.com/wapi/zpgeek/friend/add.json",
    paramObj
  );
  try {
    const res = await axios.post(url, null, {
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
    return sendPublishReq(jobTag, e.message, retries - 1);
  }
}

export const useDeliver = () => {
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

  function createHandle(): (args: handleArgs) => Promise<void> {
    // 无需调用接口
    const handles: Array<(args: handleArgs) => Promise<void>> = [];
    // 需要调用接口
    const handlesRes: Array<(args: handleArgs) => Promise<void>> = [];

    // 岗位名筛选
    if (formData.jobTitle.enable) {
      handles.push(async ({ el, title }) => {
        try {
          const text = title || getElText(".job-title .job-name", el);
          if (!text) throw new Error("岗位名为空");
          for (const x of formData.jobTitle.value) {
            if (text.includes(x)) {
              if (formData.jobTitle.include) {
                return;
              }
              throw new JobTitleError(`含有排除关键词 [${x}]`);
            }
          }
          if (formData.jobTitle.include) {
            throw new JobTitleError("不包含关键词");
          }
        } catch (e: any) {
          throw new JobTitleError(e.message);
        }
      });
    }
    // 公司名筛选
    if (formData.company.enable) {
      handles.push(async ({ el, company }) => {
        try {
          const text =
            company || getElText(".job-card-right .company-name a", el);
          if (!text) throw new Error("公司名为空");
          for (const x of formData.jobTitle.value) {
            if (text.includes(x)) {
              if (formData.jobTitle.include) {
                return;
              }
              throw new CompanyNameError(`含有排除关键词 [${x}]`);
            }
          }
          if (formData.jobTitle.include) {
            throw new CompanyNameError("不包含关键词");
          }
        } catch (e: any) {
          throw new CompanyNameError(e.message);
        }
      });
    }
    // 薪资筛选
    if (formData.salaryRange.enable) {
      handles.push(async ({ el }) => {
        try {
          const text = getElText(".job-info .salary", el);
          const [v, e] = rangeMatch(text, formData.salaryRange.value);
          if (!v) throw new SalaryError(`不匹配的范围 [${e}]`);
        } catch (e: any) {
          throw new SalaryError(e.message);
        }
      });
    }
    // 公司规模筛选
    if (formData.companySizeRange.enable) {
      handles.push(async ({ el }) => {
        try {
          const text = getElText(
            ".job-card-right .company-tag-list", // li:last-child
            el
          );
          const [v, e] = rangeMatch(text, formData.companySizeRange.value);
          if (!v) throw new CompanySizeError(`不匹配的规模 [${e}]`);
        } catch (e: any) {
          throw new CompanySizeError(e.message);
        }
      });
    }
    // 工作内容筛选
    if (formData.jobContent.enable) {
      handlesRes.push(async ({ el, card }) => {
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
              throw new JobDescriptionError(`含有排除关键词 [${x}]`);
            }
          }
          if (formData.jobContent.include) {
            throw new JobDescriptionError("不包含关键词");
          }
        } catch (e: any) {
          throw new JobDescriptionError(e.message);
        }
      });
    }
    return async (args: handleArgs) => {
      try {
        await Promise.all(handles.map((handle) => handle(args)));
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
            await Promise.all(handlesRes.map((handle) => handle(args)));
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
    };
  }

  async function jobListHandle(jobList: NodeListOf<Element>) {
    const h = createHandle();
    for (const i in jobList) {
      if (deliverStop.value) return;
      try {
        const title = getElText(".job-title .job-name", jobList[i]);
        const company = getElText(
          ".job-card-right .company-name a",
          jobList[i]
        );

        console.log(title, "开始处理");
        try {
          await h({ el: jobList[i], title, company });
          console.log(title, "处理通过,开始投递");
          sendPublishReq(jobList[i]);
        } catch (e: any) {
          console.log(title, "处理失败", e.name, e.message, e.cause);
        }
      } finally {
        await delay(2000);
      }
    }
  }
  return {
    createHandle,
    jobListHandle,
    rangeMatch,
    sendPublishReq,
  };
};
