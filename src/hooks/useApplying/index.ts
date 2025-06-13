import type { MyJobListData } from '@/hooks/useJobList'
import type { logData } from '../useLog'
import { errMap, JobAddressError, UnknownError } from '@/types/deliverError'
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
  // 需要调用amap接口
  const handlesAmapRes: handleFn[] = []
  // 需要amap之后筛选接口, AI 筛选
  const handlesAmapAfter: handleFn[] = []
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

  // 高德地图
  if (formData.amap.enable) {
    const amapHandler = (id: string, distance: boolean, duration: boolean, amap?: { ok: boolean, distance: number, duration: number }) => {
      if (!amap || amap.ok === false) {
        throw new JobAddressError('高德地图未初始化')
      }
      if (distance && amap.distance > formData.amap.straightDistance * 1000) {
        throw new JobAddressError(`${id}距离超标: ${amap.distance / 1000} 设定: ${formData.amap.straightDistance}`)
      }
      if (duration && amap.duration > formData.amap.drivingDuration * 60) {
        throw new JobAddressError(`${id}时间超标: ${amap.duration / 60} 设定: ${formData.amap.drivingDuration}`)
      }
    }
    if (formData.amap.straightDistance > 0) {
      handlesAmapRes.push(async (_, ctx) => {
        if (ctx.amap == null || ctx.amap.distance == null) {
          throw new JobAddressError('高德地图未初始化')
        }
        amapHandler('直线', true, false, ctx.amap.distance.straight)
      })
    }
    if (formData.amap.drivingDistance > 0 || formData.amap.drivingDuration > 0) {
      handlesAmapRes.push(async (_, ctx) => {
        if (ctx.amap == null || ctx.amap.distance == null) {
          throw new JobAddressError('高德地图未初始化')
        }
        amapHandler('驾车', formData.amap.drivingDistance > 0, formData.amap.drivingDuration > 0, ctx.amap.distance.driving)
      })
    }
    if (formData.amap.walkingDistance > 0 || formData.amap.walkingDuration > 0) {
      handlesAmapRes.push(async (_, ctx) => {
        if (ctx.amap == null || ctx.amap.distance == null) {
          throw new JobAddressError('高德地图未初始化')
        }
        amapHandler('步行', formData.amap.walkingDistance > 0, formData.amap.walkingDuration > 0, ctx.amap.distance.walking)
      })
    }
  }

  // AI过滤
  if (formData.aiFiltering.enable)
    h.aiFiltering(handlesAmapAfter)

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
        if (formData.amap.enable) {
          ctx.amap ??= {}
          try {
            ctx.amap.geocode = await amapGeocode(args.data.card?.address ?? '')
            if (ctx.amap.geocode && ctx.amap.geocode?.location) {
              ctx.amap.distance = await amapDistance(ctx.amap.geocode.location)
            }
            else {
              throw new JobAddressError('高德地图未初始化')
            }
          }
          catch (e) {
            logger.error('高德地图错误', e)
            throw new JobAddressError(`错误: ${e instanceof Error ? e.message : '未知'}`)
          }

          for (const handle of handlesAmapRes) {
            await handle(args, ctx)
          }
        }
        for (const handle of handlesAmapAfter) {
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
