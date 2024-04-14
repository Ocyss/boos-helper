import { UnknownError, errMap } from "@/types/deliverError";
import { handleFn } from "./type";
import { requestCard } from "./api";
import { useConfFormData } from "../useConfForm";
import * as h from "./handles";
import { logData } from "../useLog";
export * from "./api";
const { formData } = useConfFormData();

export function createHandle(): {
  before: handleFn;
  after: handleFn;
  record: (ctx: logData) => Promise<void>;
} {
  // 无需调用接口
  const handles: handleFn[] = [];
  // 需要调用接口
  const handlesRes: handleFn[] = [];
  const handlesAfter: handleFn[] = [];

  // 已沟通过滤
  h.communicated(handles);
  // 岗位名筛选
  if (formData.jobTitle.enable) h.jobTitle(handles);
  // 公司名筛选
  if (formData.company.enable) h.company(handles);
  // 薪资筛选
  if (formData.salaryRange.enable) h.salaryRange(handles);
  // 公司规模筛选
  if (formData.companySizeRange.enable) h.companySizeRange(handles);
  // 工作内容筛选
  if (formData.jobContent.enable) h.jobContent(handlesRes);
  // AI过滤
  if (formData.aiFiltering.enable) h.aiFiltering(handlesRes);
  // 活跃度过滤
  if (formData.activityFilter.value) h.activityFilter(handlesRes);
  // 自定义招呼语
  if (formData.customGreeting.enable && !formData.customGreeting.enable)
    h.customGreeting(handlesAfter);
  // AI招呼语
  if (formData.aiGreeting.enable) h.aiGreeting(handlesAfter);
  return {
    before: async (args, ctx) => {
      try {
        await Promise.all(handles.map((handle) => handle(args, ctx)));
        if (handlesRes.length > 0) {
          const res = await requestCard({
            lid: args.data.lid,
            securityId: args.data.securityId,
          });
          if (res.data.code == 0) {
            ctx.card = res.data.zpData.jobCard;

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
        if (!ctx.card) {
          const res = await requestCard({
            lid: args.data.lid,
            securityId: args.data.securityId,
          });
          if (res.data.code == 0) {
            ctx.card = res.data.zpData.jobCard;
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
    record: (ctx) => {
      if (formData.record.enable) return h.record(ctx);
      return Promise.resolve();
    },
  };
}
