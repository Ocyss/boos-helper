import type { logData } from '../useLog'
import type { handleFn } from './type'
import { errMap, UnknownError } from '@/types/deliverError'
import { useConfFormData } from '../useConfForm'
import { requestCard } from './api'
import * as h from './handles'

export * from './api'
const { formData } = useConfFormData()

export function createHandle(): {
  before: handleFn
  after: handleFn
  record: (ctx: logData) => Promise<void>
} {
  // 无需调用接口
  const handles: handleFn[] = []
  // 需要调用接口
  const handlesRes: handleFn[] = []
  // 投递后调用
  const handlesAfter: handleFn[] = []

  // 已沟通过滤
  h.communicated(handles)
  // 岗位名筛选
  if (formData.jobTitle.enable)
    h.jobTitle(handles)
  // 公司名筛选
  if (formData.company.enable)
    h.company(handles)
  // 薪资筛选
  if (formData.salaryRange.enable)
    h.salaryRange(handles)
  // 公司规模筛选
  if (formData.companySizeRange.enable)
    h.companySizeRange(handles)
  // 猎头过滤
  if (formData.goldHunterFilter.value)
    h.goldHunterFilter(handles)
  // 好友状态过滤
  if (formData.friendStatus.value)
    h.jobFriendStatus(handlesRes)
  // 工作内容筛选
  if (formData.jobContent.enable)
    h.jobContent(handlesRes)
  // Hr职位筛选
  if (formData.hrPosition.enable)
    h.hrPosition(handlesRes)
  // 活跃度过滤
  if (formData.activityFilter.value)
    h.activityFilter(handlesRes)
  // AI过滤
  if (formData.aiFiltering.enable)
    h.aiFiltering(handlesRes)

  if (formData.aiGreeting.enable) {
    // AI招呼语
    h.aiGreeting(handlesAfter)
  }
  else if (formData.customGreeting.enable) {
    // 自定义招呼语
    h.customGreeting(handlesAfter)
  }

  return {
    before: async (args, ctx) => {
      try {
        // 异步运行 card 请求前的筛选
        await Promise.all(handles.map(handle => handle(args, ctx)))

        if (handlesRes.length > 0) {
          const cardResp = await requestCard({
            lid: args.data.lid,
            securityId: args.data.securityId,
          })
          if (cardResp.data.code === 0) {
            ctx.card = cardResp.data.zpData.jobCard
            // 异步运行 card 请求后的筛选
            await Promise.all(handlesRes.map(handle => handle(args, ctx)))
          }
          else {
            throw new UnknownError(`请求响应错误:${cardResp.data.message}`)
          }
        }
      }
      catch (e: any) {
        if (errMap.has(e.name)) {
          throw e
        }
        throw new UnknownError(`预期外:${e.message}`)
      }
    },
    after: async (args, ctx) => {
      if (handlesAfter.length === 0)
        return
      try {
        if (!ctx.card) {
          const cardResp = await requestCard({
            lid: args.data.lid,
            securityId: args.data.securityId,
          })
          if (cardResp.data.code === 0) {
            ctx.card = cardResp.data.zpData.jobCard
          }
          else {
            throw new UnknownError(`请求响应错误:${cardResp.data.message}`)
          }
        }
        await Promise.all(handlesAfter.map(handle => handle(args, ctx)))
      }
      catch (e: any) {
        if (errMap.has(e.name)) {
          throw e
        }
        throw new UnknownError(`预期外:${e.message}`)
      }
    },
    record: (ctx) => {
      if (formData.record.enable)
        return h.record(ctx)
      return Promise.resolve()
    },
  }
}
