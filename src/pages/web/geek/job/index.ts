import {
  GM_addStyle,
  GM_addValueChangeListener,
  GM_getValue,
  GM_setValue,
} from "$";
import { JobCard } from "@/types/jobCard";
import { notification } from "@/utils/notification";
import { logger } from "@/utils/logger";
import axios from "axios";
import { delay } from "@/utils";
import { Ctx } from "@/utils/context";
import { createApp } from "vue";
// import { ScriptConfig } from "./config";
import { filterKey } from "./type";
import uiVue from "./ui.vue";
function createCustomError(name: string): any {
  return class CustomError extends Error {
    constructor(msg?: string) {
      super(msg);
      this.name = name;
      Object.setPrototypeOf(this, CustomError.prototype);
    }
  };
}

const BossBatchExp = createCustomError("BossBatchExp");
const JobNotMatchExp = createCustomError("JobNotMatchExp");
const PublishLimitExp = createCustomError("PublishLimitExp");
const FetchJobDetailFailExp = createCustomError("FetchJobDetailFailExp");
const SendPublishExp = createCustomError("SendPublishExp");
const PublishStopExp = createCustomError("PublishStopExp");

class OperationPanel {
  batchPushBtn?: HTMLElement;
  activeSwitchBtn?: HTMLElement;
  sendSelfGreetSwitchBtn?: HTMLElement;
  cnInInputLab?: HTMLLabelElement;
  cnExInputLab?: HTMLLabelElement;
  jnInInputLab?: HTMLLabelElement;
  jcExInputLab?: HTMLLabelElement;
  srInInputLab?: HTMLLabelElement;
  csrInInputLab?: HTMLLabelElement;
  selfGreetInputLab?: HTMLLabelElement;
  worldCloudModal?: HTMLElement;
  worldCloudState?: boolean;
  worldCloudAllBtn?: HTMLElement;
  topTitle?: HTMLElement;
  bossActiveState: boolean;
  sendSelfGreet: boolean;
  // scriptConfig: ScriptConfig;
  jobListHandler: JobListPageHandler;
  showTable: any;
  constructor(jobListHandler: JobListPageHandler) {
    // boss活跃度检测
    this.bossActiveState = true;
    // 发送自定义招呼语
    this.sendSelfGreet = false;

    // this.scriptConfig = new ScriptConfig();
    this.jobListHandler = jobListHandler;
  }

  init() {
    this.renderOperationPanel();
  }

  /**
   * 渲染操作面板
   */
  renderOperationPanel() {
    let timingCutPageTask = setInterval(() => {
      const jobSearchWrapper = document.querySelector(".job-search-wrapper");
      if (!jobSearchWrapper) {
        return;
      }
      const app = createApp(uiVue);
      app.mount(
        (() => {
          const jobEl = document.createElement("div");
          jobEl.id = "boos-helper-job";
          jobSearchWrapper.insertBefore(
            jobEl,
            jobSearchWrapper.firstElementChild
          );
          jobSearchWrapper.setAttribute("help", "出界了哇!");
          return jobEl;
        })()
      );
      clearInterval(timingCutPageTask);
      return;
    });
  }

  refreshShow(text: string) {
    this.showTable.innerHTML = "当前操作：" + text;
  }

  /*-------------------------------------------------操作面板事件处理--------------------------------------------------*/

  batchPushBtnHandler() {
    this.jobListHandler.batchPushHandler();
  }

  storeConfigBtnHandler() {
    // 先修改配置对象内存中的值，然后更新到本地储存中
    // logger.debug("config", this.scriptConfig);
    // this.scriptConfig.storeConfig();
  }

  /*-------------------------------------------------other method--------------------------------------------------*/

  changeBatchPublishBtn(start: boolean) {
    if (this.batchPushBtn)
      if (start) {
        this.batchPushBtn.innerHTML = "停止投递";
        this.batchPushBtn.style.backgroundColor = "rgb(251,224,224)";
        this.batchPushBtn.style.color = "rgb(254,61,61)";
      } else {
        this.batchPushBtn.innerHTML = "批量投递";
        this.batchPushBtn.style.backgroundColor = "rgb(215,254,195)";
        this.batchPushBtn.style.color = "rgb(2,180,6)";
      }
  }
}

class BossDOMApi {
  static getJobList() {
    return Array.from(
      document.querySelectorAll<HTMLLIElement>(".job-card-wrapper")
    );
  }

  static getJobTitle(jobTag: HTMLElement) {
    let innerText = jobTag.querySelector<HTMLElement>(".job-title")?.innerText;
    return innerText?.replace("\n", " ");
  }

  static getCompanyName(jobTag: HTMLElement) {
    return jobTag.querySelector<HTMLElement>(".company-name")?.innerText;
  }

  static getJobName(jobTag: HTMLElement) {
    return jobTag.querySelector<HTMLElement>(".job-name")?.innerText;
  }

  static getSalaryRange(jobTag: HTMLElement) {
    let text = jobTag.querySelector<HTMLElement>(".salary")?.innerText;
    if (text && text.includes(".")) {
      // 1-2K·13薪
      return text.split("·")[0];
    }
    return text;
  }

  static getCompanyScaleRange(jobTag: HTMLElement) {
    return jobTag.querySelector<HTMLElement>(".company-tag-list")
      ?.lastElementChild?.innerHTML;
  }

  /**
   * 获取当前job标签的招聘人名称以及他的职位
   * @param jobTag
   */
  static getBossNameAndPosition(jobTag: any) {
    let nameAndPositionTextArr = jobTag
      .querySelector(".info-public")
      .innerHTML.split("<em>");
    nameAndPositionTextArr[0] = nameAndPositionTextArr[0].trim();
    nameAndPositionTextArr[1] = nameAndPositionTextArr[1]
      .replace("</em>", "")
      .trim();
    return nameAndPositionTextArr;
  }

  /**
   * 是否为未沟通
   * @param jobTag
   */
  static isNotCommunication(jobTag: any) {
    const jobStatusStr = jobTag.querySelector(".start-chat-btn").innerText;
    return jobStatusStr.includes("立即沟通");
  }

  static getJobDetailUrlParams(jobTag: any) {
    return jobTag.querySelector(".job-card-left")?.href.split("?")[1];
  }

  static getDetailSrc(jobTag: any) {
    return jobTag.querySelector(".job-card-left").href;
  }

  static getUniqueKey(jobTag: HTMLElement) {
    const title = this.getJobTitle(jobTag);
    const company = this.getCompanyName(jobTag);
    return `${title}--${company}`;
  }

  static nextPage() {
    let nextPageBtn = document.querySelector<HTMLButtonElement>(
      ".ui-icon-arrow-right"
    );

    if (nextPageBtn?.parentElement?.className === "disabled") {
      // 没有下一页
      return;
    }
    nextPageBtn?.click();
    return true;
  }
}

class Tools {
  static fuzzyMatch(
    arr: any[],
    input: string | null | undefined,
    emptyStatus: boolean
  ) {
    if (arr.length === 0) {
      // 为空时直接返回指定的空状态
      return emptyStatus;
    }
    input = (input ?? "").toLowerCase();
    let emptyEle = false;
    // 遍历数组中的每个元素
    for (let i = 0; i < arr.length; i++) {
      // 如果当前元素包含指定值，则返回 true
      let arrEleStr = arr[i].toLowerCase();
      if (arrEleStr.length === 0) {
        emptyEle = true;
        continue;
      }
      if (arrEleStr.includes(input) || input.includes(arrEleStr)) {
        return true;
      }
    }

    // 所有元素均为空元素【返回空状态】
    if (emptyEle) {
      return emptyStatus;
    }

    // 如果没有找到匹配的元素，则返回 false
    return false;
  }

  // 范围匹配
  static rangeMatch(rangeStr: string, input?: string, by = 1) {
    console.log(rangeStr, input, !rangeStr);

    if (!rangeStr) {
      return true;
    }
    // 匹配定义范围的正则表达式
    let reg = /^(\d+)(?:-(\d+))?$/;
    let match = rangeStr.match(reg);

    if (match && input) {
      let start = parseInt(match[1]) * by;
      let end = parseInt(match[2] || match[1]) * by;

      // 如果输入只有一个数字的情况
      if (/^\d+$/.test(input)) {
        let number = parseInt(input);
        return number >= start && number <= end;
      }

      // 如果输入有两个数字的情况
      let inputReg = /^(\d+)(?:-(\d+))?/;
      let inputMatch = input.match(inputReg);
      if (inputMatch) {
        let inputStart = parseInt(inputMatch[1]);
        let inputEnd = parseInt(inputMatch[2] || inputMatch[1]);
        return (
          (inputStart >= start && inputStart <= end) ||
          (inputEnd >= start && inputEnd <= end)
        );
      }
    }

    // 其他情况均视为不匹配
    return false;
  }

  static semanticMatch(configArr: string[], content: string) {
    for (let i = 0; i < configArr.length; i++) {
      if (!configArr[i]) {
        continue;
      }
      let re = new RegExp(
        "(?<!(不|无).{0,5})" + configArr[i] + "(?!系统|软件|工具|服务)"
      );
      if (re.test(content)) {
        return configArr[i];
      }
    }
  }

  static bossIsActive(activeText: string) {
    return !(activeText.includes("月") || activeText.includes("年"));
  }

  static getRandomNumber(startMs: number, endMs: number) {
    return Math.floor(Math.random() * (endMs - startMs + 1)) + startMs;
  }

  static getCookieValue(key: string) {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.trim().split("=");
      if (cookieKey === key) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  static parseURL(url: string) {
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

  static queryString(
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
}

class JobListPageHandler {
  operationPanel: OperationPanel;
  // scriptConfig: ScriptConfig;
  publishState: boolean;
  nextPage: boolean;
  mock: boolean;
  cache: Map<any, any>;
  selfDefCount: number;
  constructor() {
    this.operationPanel = new OperationPanel(this);
    // this.scriptConfig = this.operationPanel.scriptConfig;
    this.operationPanel.init();
    this.publishState = false;
    this.nextPage = false;
    this.mock = false;
    this.cache = new Map();
    this.selfDefCount = -1;
  }

  /**
   * 点击批量投递事件处理
   */
  batchPushHandler() {
    this.changeBatchPublishState(!this.publishState);
    if (!this.publishState) {
      return;
    }
    // 每次投递前清空投递锁，未被占用
    // GM_setValue(ScriptConfig.PUSH_LIMIT, false);
    // GM_setValue(ScriptConfig.PUSH_LOCK, "");
    // 每次读取操作面板中用户实时输入的值
    this.loopPublish();
  }

  loopPublish() {
    // 过滤当前页满足条件的job并投递
    this.filterCurPageAndPush();

    // 等待处理完当前页的jobList在投递下一页
    let nextPageTask = setInterval(() => {
      if (!this.nextPage) {
        logger.debug("正在等待当前页投递完毕...");
        return;
      }
      clearInterval(nextPageTask);

      if (!this.publishState) {
        logger.info("投递结束");
        notification("投递结束");
        this.operationPanel.refreshShow("投递停止");
        this.changeBatchPublishState(false);
        return;
      }
      if (!BossDOMApi.nextPage()) {
        logger.info("投递结束，没有下一页");
        notification("投递结束，没有下一页");
        this.operationPanel.refreshShow("投递结束，没有下一页");
        this.changeBatchPublishState(false);
        return;
      }
      this.operationPanel.refreshShow("开始等待 10 秒钟,进行下一页");
      // 点击下一页，需要等待页面元素变化，否则将重复拿到当前页的jobList
      setTimeout(() => {
        this.loopPublish();
      }, 10000);
    }, 3000);
  }

  changeBatchPublishState(publishState: boolean) {
    this.publishState = publishState;
    this.operationPanel.changeBatchPublishBtn(publishState);
  }

  async filterCurPageAndPush() {
    this.nextPage = false;
    let notMatchCount = 0;
    let publishResultCount = {
      successCount: 0,
      failCount: 0,
    };
    const handle = async (ctx: Ctx, jobTag: HTMLElement) => {
      let jobTitle = BossDOMApi.getJobTitle(jobTag);
      try {
        await this.matchJobPromise(jobTag);
        const jobCardJson = await this.reqJobDetail(ctx, jobTag);
        const gptMsg = `
岗位名:${jobCardJson.jobName}
岗位描述:{${jobCardJson.postDescription}}
薪酬:${jobCardJson.salaryDesc}
经验要求:${jobCardJson.experienceName},学历要求:${jobCardJson.degreeName}
相关标签:${jobCardJson.jobLabels}`;
        // await this.jobDetailFilter(ctx, jobTag, jobCardJson);
        return await axios.post("http://127.0.0.1:5000", {
          content: gptMsg,
        });
        const publishResult = await this.sendPublishReq(ctx, jobTag);
        // return await this.handlerPublishResult(
        //   ctx,
        //   jobTag,
        //   publishResult,
        //   publishResultCount
        // );
      } catch (error: any) {
        // 在catch中return是结束当前元素，不会结束整个promiseChain；
        // 需要结束整个promiseChain，在catch throw exp,但还会继续执行下一个元素catch中的逻辑
        switch (true) {
          case error instanceof JobNotMatchExp:
            this.operationPanel.refreshShow(jobTitle + " 不满足投递条件");
            ++notMatchCount;
            break;

          case error instanceof FetchJobDetailFailExp:
            ctx.add("job详情页数据获取失败：" + error);
            break;

          case error instanceof SendPublishExp:
            ctx.add("投递失败;" + jobTitle + " 原因：" + error.message);
            this.operationPanel.refreshShow(jobTitle + " 投递失败");
            publishResultCount.failCount++;
            break;

          case error instanceof PublishLimitExp:
            // GM_setValue(ScriptConfig.PUSH_LIMIT, true);
            this.operationPanel.refreshShow("停止投递 " + error.message);

            logger.error("投递停止; 原因：" + error.message);
            ctx.add("投递停止; 原因：" + error.message);
            throw new PublishStopExp(error.message);

          case error instanceof PublishStopExp:
            this.changeBatchPublishState(false);
            // 结束整个投递链路
            throw error;
          default:
            ctx.add(
              BossDOMApi.getDetailSrc(jobTag) + "-->未捕获投递异常:",
              error
            );
            logger.debug(
              BossDOMApi.getDetailSrc(jobTag) + "-->未捕获投递异常:",
              error
            );
        }
      } finally {
        ctx.log();
      }
    };
    let jobList = BossDOMApi.getJobList();
    logger.debug("filterCurPageAndPush-jobList", jobList);

    let process: Promise<any>[] = [];
    for (let jobTag of jobList) {
      await delay(2000);
      const ctx = logger.ctx("filterCurPageAndPush-jobTag开始投递");
      process.push(handle(ctx, jobTag));
    }
    Promise.all(process).then(() => {
      logger.info(`当前页投递完毕---------------------------------------------------
不满足条件的job数量：${notMatchCount}
投递Job成功数量：${publishResultCount.successCount}
投递Job失败数量：${publishResultCount.failCount}
当前页投递完毕---------------------------------------------------
      `);
      this.nextPage = true;
    });
  }

  cacheClear() {
    this.cache.clear();
  }
  cacheSize() {
    return this.cache.size;
  }
  reqJobDetail(ctx: Ctx, jobTag: HTMLElement, retries = 3): Promise<JobCard> {
    return new Promise((resolve, reject) => {
      if (retries === 0) {
        return reject(new FetchJobDetailFailExp());
      }
      // todo 如果在投递当前页中，点击停止投递，那么当前页重新投递的话，会将已经投递的再重新投递一遍
      //  原因是没有重新获取数据；沟通状态还是立即沟通，实际已经投递过一遍，已经为继续沟通
      //  暂时不影响逻辑，重复投递，boss自己会过滤，不会重复发送消息；发送自定义招呼语也没问题；油猴会过滤【oldVal===newVal】的数据，也就不会重复发送自定义招呼语
      const key = BossDOMApi.getUniqueKey(jobTag);
      if (this.cache.has(key)) {
        return resolve(this.cache.get(key));
      }
      let params = BossDOMApi.getJobDetailUrlParams(jobTag);
      axios
        .get("https://www.zhipin.com/wapi/zpgeek/job/card.json?" + params, {
          timeout: 5000,
        })
        .then((resp) => {
          this.cache.set(key, resp.data.zpData.jobCard);
          return resolve(resp.data.zpData.jobCard);
        })
        .catch((error) => {
          ctx.add("获取详情页异常正在重试:", error);
          return this.reqJobDetail(ctx, jobTag, retries - 1);
        });
    });
  }

  // jobDetailFilter(ctx: Ctx, jobTag: HTMLElement, jobCardJson: any) {
  //   let jobTitle = BossDOMApi.getJobTitle(jobTag);

  //   return new Promise<void>((resolve, reject) => {
  //     // 工作详情活跃度检查
  //     let activeCheck = GM_getValue(ScriptConfig.ACTIVE_ENABLE, true);
  //     let activeTimeDesc = jobCardJson.activeTimeDesc;
  //     if (activeCheck && !Tools.bossIsActive(activeTimeDesc)) {
  //       ctx.add("当前boss活跃度：" + activeTimeDesc);
  //       ctx.add("当前job被过滤：【" + jobTitle + "】 原因：不满足活跃度检查");
  //       return reject(new JobNotMatchExp());
  //     }

  //     // 工作内容检查
  //     let jobContentExclude = this.scriptConfig.getArrConfig(filterKey.jcExKey);
  //     const jobContentMismatch = Tools.semanticMatch(
  //       jobContentExclude,
  //       jobCardJson.postDescription
  //     );
  //     if (jobContentMismatch) {
  //       ctx.add("当前job工作内容：" + jobCardJson.postDescription);
  //       ctx.add(
  //         `当前job被过滤：【${jobTitle}】 原因：不满足工作内容(${jobContentMismatch})`
  //       );
  //       return reject(new JobNotMatchExp());
  //     }
  //     setTimeout(() => {
  //       // 获取不同的延时，避免后面投递时一起导致频繁
  //       return resolve();
  //     }, Tools.getRandomNumber(100, 200));
  //   });
  // }

  // handlerPublishResult(
  //   ctx: Ctx,
  //   jobTag: HTMLElement,
  //   result: any,
  //   publishResultCount: any
  // ) {
  //   return new Promise<void>((resolve, reject) => {
  //     if (result.message === "Success" && result.code === 0) {
  //       // 增加投递数量，触发投递监听，更新页面投递计数
  //       ScriptConfig.pushCountIncr();
  //       publishResultCount.successCount++;
  //       ctx.add("投递成功：" + BossDOMApi.getJobTitle(jobTag));

  //       // 改变消息key，通知msg页面处理当前job发送自定义招呼语句
  //       GM_setValue(
  //         ScriptConfig.PUSH_MESSAGE,
  //         JobMessagePageHandler.buildMsgKey(jobTag)
  //       );

  //       // 每页投递次数【默认不会走】
  //       if (
  //         this.selfDefCount !== -1 &&
  //         publishResultCount.successCount >= this.selfDefCount
  //       ) {
  //         return reject(
  //           new PublishStopExp("自定义投递限制：" + this.selfDefCount)
  //         );
  //       }
  //       return resolve();
  //     }

  //     if (result.message.includes("今日沟通人数已达上限")) {
  //       return reject(new PublishLimitExp(result.message));
  //     }

  //     return reject(new SendPublishExp(result.message));
  //   });
  // }

  sendPublishReq(
    ctx: Ctx,
    jobTag: HTMLElement,
    errorMsg?: string,
    retries = 3
  ) {
    let jobTitle = BossDOMApi.getJobTitle(jobTag);
    if (retries === 3) {
      ctx.add("正在投递：" + jobTitle);
    }
    return new Promise((resolve, reject) => {
      if (retries === 0) {
        return reject(new SendPublishExp(errorMsg));
      }
      if (!this.publishState) {
        return reject(new PublishStopExp("停止投递"));
      }

      // 检查投递限制
      // let pushLimit = GM_getValue(ScriptConfig.PUSH_LIMIT, false);
      // if (pushLimit) {
      //   this.changeBatchPublishState(false);
      //   return reject(new PublishLimitExp("boss投递限制每天100次"));
      // }

      if (this.mock) {
        let result = {
          message: "Success",
          code: 0,
        };
        return resolve(result);
      }

      let src = BossDOMApi.getDetailSrc(jobTag);
      let paramObj = Tools.parseURL(src);
      let publishUrl = "https://www.zhipin.com/wapi/zpgeek/friend/add.json";
      let url = Tools.queryString(publishUrl, paramObj);

      let pushLockTask = setInterval(() => {
        if (!this.publishState) {
          clearInterval(pushLockTask);
          return reject(new PublishStopExp());
        }
        // let lock = GM_getValue(ScriptConfig.PUSH_LOCK, "");
        // if (lock && lock !== jobTitle) {
        //   return ctx.add("投递锁被其他job占用：" + lock);
        // }
        // // 停止锁检查并占用投递锁
        // clearInterval(pushLockTask);
        // GM_setValue(ScriptConfig.PUSH_LOCK, jobTitle);
        ctx.add("锁定投递锁：" + jobTitle);

        this.operationPanel.refreshShow("正在投递-->" + jobTitle);
        // 投递请求
        axios
          .post(url, null, {
            headers: { Zp_token: Tools.getCookieValue("geek_zp_token") },
          })
          .then((resp) => {
            if (
              resp.data.code === 1 &&
              resp.data?.zpData?.bizData?.chatRemindDialog?.content
            ) {
              // 某些条件不满足，boss限制投递，无需重试，在结果处理器中处理
              return resolve({
                code: 1,
                message: resp.data?.zpData?.bizData?.chatRemindDialog?.content,
              });
            }

            if (resp.data.code !== 0) {
              throw new SendPublishExp(resp.data.message);
            }
            return resolve(resp.data);
          })
          .catch((error) => {
            ctx.add("投递异常正在重试:" + jobTitle, error);
            return resolve(
              this.sendPublishReq(ctx, jobTag, error.message, retries - 1)
            );
          })
          .finally(() => {
            // 释放投递锁
            ctx.add("释放投递锁：" + jobTitle);
            // GM_setValue(ScriptConfig.PUSH_LOCK, "");
          });
      }, 800);
    });
  }

  matchJobPromise(jobTag: HTMLElement) {
    return new Promise((resolve, reject) => {
      // if (!this.matchJob(jobTag)) {
      //   return reject(new JobNotMatchExp());
      // }
      return resolve(jobTag);
    });
  }

  // matchJob(jobTag: HTMLElement) {
  //   let jobTitle = BossDOMApi.getJobTitle(jobTag);
  //   let pageCompanyName = BossDOMApi.getCompanyName(jobTag);

  //   // 不满足配置公司名
  //   if (
  //     !Tools.fuzzyMatch(
  //       this.scriptConfig.getArrConfig(filterKey.cnInKey),
  //       pageCompanyName,
  //       true
  //     )
  //   ) {
  //     logger.debug("当前公司名：" + pageCompanyName);
  //     logger.info("当前job被过滤：【" + jobTitle + "】 原因：不满足配置公司名");
  //     return false;
  //   }

  //   // 满足排除公司名
  //   if (
  //     Tools.fuzzyMatch(
  //       this.scriptConfig.getArrConfig(filterKey.cnExKey),
  //       pageCompanyName,
  //       false
  //     )
  //   ) {
  //     logger.debug("当前公司名：" + pageCompanyName);
  //     logger.info("当前job被过滤：【" + jobTitle + "】 原因：满足排除公司名");
  //     return false;
  //   }

  //   // 不满足配置工作名
  //   let pageJobName = BossDOMApi.getJobName(jobTag);
  //   if (
  //     !Tools.fuzzyMatch(
  //       this.scriptConfig.getArrConfig(filterKey.jnInKey),
  //       pageJobName,
  //       true
  //     )
  //   ) {
  //     logger.debug("当前工作名：" + pageJobName);
  //     logger.info("当前job被过滤：【" + jobTitle + "】 原因：不满足配置工作名");
  //     return false;
  //   }

  //   // 不满足新增范围
  //   let pageSalaryRange = BossDOMApi.getSalaryRange(jobTag);
  //   let salaryRange = this.scriptConfig.getConfig(filterKey.srInKey);
  //   if (!Tools.rangeMatch(salaryRange, pageSalaryRange)) {
  //     logger.debug("当前薪资范围：" + pageSalaryRange);
  //     logger.info("当前job被过滤：【" + jobTitle + "】 原因：不满足薪资范围");
  //     return false;
  //   }

  //   let pageCompanyScaleRange = this.scriptConfig.getConfig(filterKey.csrInKey);
  //   if (
  //     !Tools.rangeMatch(
  //       pageCompanyScaleRange,
  //       BossDOMApi.getCompanyScaleRange(jobTag)
  //     )
  //   ) {
  //     logger.debug("当前公司规模范围：" + pageCompanyScaleRange);
  //     logger.info(
  //       "当前job被过滤：【" + jobTitle + "】 原因：不满足公司规模范围"
  //     );
  //     return false;
  //   }

  //   if (!BossDOMApi.isNotCommunication(jobTag)) {
  //     logger.info("当前job被过滤：【" + jobTitle + "】 原因：已经沟通过");
  //     return false;
  //   }

  //   return true;
  // }
}

class JobMessagePageHandler {
  // scriptConfig: ScriptConfig;
  constructor() {
    // this.scriptConfig = new ScriptConfig();
    this.init();
  }

  init() {
    this.registerEvent();
  }

  registerEvent() {
    // GM_addValueChangeListener(
    //   ScriptConfig.PUSH_MESSAGE,
    //   this.pushAlterMsgHandler.bind(this)
    // );
    logger.debug("注册投递推送消费者成功");
  }

  /**
   * 投递后发送自定义打招呼语句【发送自定义消息】
   */
  pushAlterMsgHandler(
    key: any,
    oldValue: any,
    newValue: any,
    isOtherScriptChange: any
  ) {
    logger.debug("投递后推送自定义招呼语消费者", {
      key,
      oldValue,
      newValue,
      isOtherScriptChange,
    });
    if (!isOtherScriptChange) {
      return;
    }
    if (oldValue.key === newValue.key) {
      return;
    }

    // 是否打开配置
    // if (!GM_getValue(ScriptConfig.SEND_SELF_GREET_ENABLE, false)) {
    //   return;
    // }

    // let selfGreetMsg = this.getSelfGreet();
    // if (!selfGreetMsg) {
    //   logger.debug("自定义招呼语为空结束");
    //   return;
    // }
    // selfGreetMsg = selfGreetMsg
    //   .replaceAll("$JOBNAME$", newValue.jobName)
    //   .replaceAll("$COMPANYNAME$", newValue.companyName)
    //   .replaceAll("$BOSSNAME$", newValue.bossName);
    let count = 0;
    let process = Promise.resolve();
    let sendMsgTask = setInterval(() => {
      process
        .then(() => {
          if (++count >= 5) {
            logger.debug("发送自定义打招呼语句超时结束");
            clearInterval(sendMsgTask);
            return;
          }
          return new Promise<void>((resolve, reject) => {
            let msgTag = JobMessagePageHandler.selectMessage(newValue.key);
            if (!msgTag) {
              return reject();
            }
            // 点击当前待处理的消息框
            msgTag.click();
            logger.debug("选中消息", msgTag);
            return resolve();
          });
        })
        .then(() => {
          return new Promise<void>((resolve, reject) => {
            if (!JobMessagePageHandler.ableInput()) {
              return reject();
            }
            return resolve();
          });
        })
        .then(() => {
          return new Promise<void>((resolve) => {
            // JobMessagePageHandler.inputMsg(selfGreetMsg);
            return resolve();
          });
        })
        .then(() => {
          return new Promise<void>((resolve, reject) => {
            if (!JobMessagePageHandler.sendAble()) {
              return reject();
            }
            return resolve();
          });
        })
        .then(() => {
          return new Promise<void>((resolve) => {
            JobMessagePageHandler.sendMsg();
            logger.info("推送自定义招呼语成功：" + newValue);
            clearInterval(sendMsgTask);
            return resolve();
          });
        })
        .catch(() => {
          // 不报错
        });
    }, 300);
  }

  // getSelfGreet() {
  //   return this.scriptConfig.getSelfGreetMemory();
  // }

  static buildMsgKey(jobTag: HTMLElement) {
    let companyName = BossDOMApi.getCompanyName(jobTag);
    let bossNameAndPosition = BossDOMApi.getBossNameAndPosition(jobTag);

    let bossName = bossNameAndPosition[0];
    let bossPositionName = bossNameAndPosition[1];
    return {
      key: bossName + companyName + bossPositionName,
      jobName: BossDOMApi.getJobName(jobTag),
      companyName,
      bossName,
    };
  }

  static ableInput() {
    return (
      document.querySelector(".chat-input") &&
      document.querySelector(".chat-im.chat-editor")
    );
  }

  static inputMsg(msg: string) {
    // <br> \n 都可以换行
    return (document.querySelector(".chat-input")!.innerHTML = msg.replaceAll(
      "\\n",
      "\n"
    ));
  }

  static sendAble() {
    let btn = document.querySelector(".btn-v2.btn-sure-v2.btn-send");
    if (btn)
      // 删除按钮标签类名；按钮可点击
      btn.classList.remove("disabled");
    return btn;
  }

  static sendMsg() {
    // 当前标签绑定的vue组件对象，
    let chatFrameVueComponent = document.querySelector<
      HTMLElement & { __vue__: any }
    >(".chat-im.chat-editor")?.__vue__;
    // 更新开启提交；否则提交拦截
    chatFrameVueComponent.enableSubmit = true;
    // 赋值发送websocket的to.uid;手动触发导致uid无值，从friendId获取
    chatFrameVueComponent.bossInfo$.uid =
      chatFrameVueComponent.bossInfo$.friendId;
    let element = document.querySelector<HTMLButtonElement>(
      ".btn-v2.btn-sure-v2.btn-send"
    );
    element?.click();
  }

  static selectMessage(messageKey: string) {
    let messageListTag = document
      ?.querySelector(".user-list")
      ?.querySelector("div")
      ?.querySelectorAll("li");
    for (let i = 0; messageListTag && i < messageListTag.length; i++) {
      // '09月02日\n刘女士赛德勤人事行政专员\n您好，打扰了，我想和您聊聊这个职位。'
      // 日期\n【boss名+公司名+职位名】\n 问候语
      let msgTitle = messageListTag[i].innerText;
      if (msgTitle.split("\n")[1] === messageKey) {
        return messageListTag[i].querySelector("div");
      }
    }

    logger.debug("本次循环消息key未检索到消息框: " + messageKey);
  }
}

export async function run() {
  logger.slice("加载/web/geek/job页面Hook");
  new JobListPageHandler();
}
