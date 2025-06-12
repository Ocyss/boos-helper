import type { MyJobListData } from '@/hooks/useJobList'
import type { logData } from '../useLog'
import { errMap, UnknownError } from '@/types/deliverError'
import { useConfFormData } from '../useConfForm'
import * as h from './handles'

export * from './utils'

export interface handleArgs {
  data: MyJobListData
}

export type handleFn = (args: handleArgs, ctx: logData) => Promise<void>
export type handleCFn = (handles: handleFn[], handlesAfter?: handleFn[]) => void

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
  // 相同公司过滤
  if (formData.sameCompanyFilter.value)
    h.SameCompanyFilter(handlesRes, handlesAfter)
  // 相同hr过滤
  if (formData.sameHrFilter.value)
    h.SameHrFilter(handlesRes, handlesAfter)
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

  // 活跃度过滤
  if (formData.activityFilter.value)
    h.activityFilter(handlesRes)
  // Hr职位筛选
  if (formData.hrPosition.enable)
    h.hrPosition(handlesRes)
  // 工作地址筛选
  if (formData.jobAddress.enable)
    h.jobAddress(handlesRes)
  // 好友状态过滤
  if (formData.friendStatus.value)
    h.jobFriendStatus(handlesRes)
  // 工作内容筛选
  if (formData.jobContent.enable)
    h.jobContent(handlesRes)
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
        // 依次执行
        for (const handle of handles) {
          await handle(args, ctx)
        }
        await args.data.getCard()
        for (const handle of handlesRes) {
          await handle(args, ctx)
        }
      }
      catch (e: any) {
        if (errMap.has(e?.name as string)) {
          throw e
        }
        throw new UnknownError(`预期外:${e.message}`)
      }
    },
    after: async (args, ctx) => {
      if (handlesAfter.length === 0)
        return
      try {
        for (const handle of handlesAfter) {
          await handle(args, ctx)
        }
      }
      catch (e: any) {
        if (errMap.has(e?.name as string)) {
          throw e
        }
        throw new UnknownError(`预期外:${e.message}`)
      }
    },
    record: async (ctx) => {
      if (formData.record.enable)
        return h.record(ctx)
      return Promise.resolve()
    },
  }
}
