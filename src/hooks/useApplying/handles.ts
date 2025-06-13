import type { logData } from '../useLog'
import type { handleCFn } from './index'
import { useChat } from '@/hooks/useChat'
import { useConfFormData } from '@/hooks/useConfForm'
import { useModel } from '@/hooks/useModel'
import { useStatistics } from '@/hooks/useStatistics'
import { getUserId } from '@/hooks/useUser'
import { Message } from '@/hooks/useWebSocket'
import {
  ActivityError,
  AIFilteringError,
  CompanyNameError,
  CompanySizeError,
  FriendStatusError,
  GoldHunterError,
  GreetError,
  HrPositionError,
  JobAddressError,
  JobDescriptionError,
  JobTitleError,
  RepeatError,
  SalaryError,
} from '@/types/deliverError'

import { getCurDay, getCurTime } from '@/utils'

import { getStorage, setStorage } from '@/utils/message/storage'
import { ElMessage } from 'element-plus'
import { miTem } from 'mitem'
import { SignedKeyLLM } from '../useModel/signedKey'
import { parseFiltering, rangeMatch, requestBossData, sameCompanyKey, sameHrKey } from './utils'

const { chatMessages } = useChat()
const { modelData, getGpt } = useModel()
const { formData } = useConfFormData()
const { todayData } = useStatistics()

export const communicated: handleCFn = (h) => {
  h.push(async ({ data }) => {
    if (data.contact) {
      throw new RepeatError(`已经沟通过`)
    }
  },
  )
}

export const SameCompanyFilter: handleCFn = (h, hAfter) => {
  let someSet: Set<string> | null = null
  let count = 0
  const uid = getUserId()
  if (uid == null) {
    throw new RepeatError('没有获取到uid')
  }
  h.push(async ({ data }) => {
    if (someSet == null) {
      someSet = new Set<string>()
      const data = await getStorage<Record<string, string[]>>(sameCompanyKey, {})
      for (const id of (data[uid] ?? [])) {
        someSet.add(id)
      }
    }
    const id = data.encryptBrandId
    if (id != null && someSet.has(id)) {
      throw new RepeatError('相同公司已投递')
    }
  })
  hAfter?.push(async ({ data }) => {
    someSet?.add(data.encryptBrandId)
    count++
    if (count > 3) {
      const oldData = await getStorage<Record<string, string[]>>(sameCompanyKey, {})
      await setStorage(sameCompanyKey, {
        ...oldData,
        [uid]: Array.from(someSet ?? []),
      })
      count = 0
    }
  })
}

export const SameHrFilter: handleCFn = (h, hAfter) => {
  let someSet: Set<string> | null = null
  let count = 0
  const uid = getUserId()
  if (uid == null) {
    throw new RepeatError('没有获取到uid')
  }
  h.push(async ({ data }) => {
    if (someSet == null) {
      someSet = new Set<string>()
      const data = await getStorage<Record<string, string[]>>(sameHrKey, {})
      for (const id of (data[uid] ?? [])) {
        someSet.add(id)
      }
    }
    const id = data.encryptBossId
    if (id != null && someSet.has(id)) {
      throw new RepeatError('相同hr已投递')
    }
  })
  hAfter?.push(async ({ data }) => {
    someSet?.add(data.encryptBossId)
    count++
    if (count > 3) {
      const oldData = await getStorage<Record<string, string[]>>(sameHrKey, {})
      await setStorage(sameHrKey, {
        ...oldData,
        [uid]: Array.from(someSet ?? []),
      })
      count = 0
    }
  })
}

export const jobTitle: handleCFn = h =>
  h.push(async ({ data }, _ctx) => {
    try {
      const text = data.jobName
      if (!text)
        throw new JobTitleError('岗位名为空')
      for (const x of formData.jobTitle.value) {
        if (text.includes(x)) {
          if (formData.jobTitle.include) {
            return
          }
          throw new JobTitleError(`岗位名含有排除关键词 [${x}]`)
        }
      }
      if (formData.jobTitle.include) {
        throw new JobTitleError('岗位名不包含关键词')
      }
    }
    catch (e) {
      todayData.jobTitle++
      throw new JobTitleError(errorHandle(e))
    }
  })

export const goldHunterFilter: handleCFn = h =>
  h.push(async ({ data }, _ctx) => {
    if (data?.goldHunter === 1) {
      todayData.goldHunterFilter++
      throw new GoldHunterError('猎头过滤')
    }
  })

export const company: handleCFn = h =>
  h.push(async ({ data }, _ctx) => {
    try {
      const text = data.brandName
      if (!text)
        throw new CompanyNameError('公司名为空')

      for (const x of formData.company.value) {
        if (text.includes(x)) {
          if (formData.company.include) {
            return
          }
          throw new CompanyNameError(`公司名含有排除关键词 [${x}]`)
        }
      }
      if (formData.company.include) {
        throw new CompanyNameError('公司名不包含关键词')
      }
    }
    catch (e) {
      todayData.company++
      throw new CompanyNameError(errorHandle(e))
    }
  })

export const salaryRange: handleCFn = h =>
  h.push(async ({ data }, _ctx) => {
    try {
      const text = data.salaryDesc

      const [v, err] = rangeMatch(
        text,
        formData.salaryRange.value,
        'intersection',
        (start, end) => {
          if (!/k/i.test(text)) {
            return [start / 1000, end / 1000]
          }
          // 兼职特殊不处理
          return [start, end]
        },
      )
      if (!v) {
        throw new SalaryError(
          `不匹配的薪资范围 [${err}],预期: ${formData.salaryRange.value}`,
        )
      }
    }
    catch (e) {
      todayData.salaryRange++
      throw new SalaryError(errorHandle(e))
    }
  })

export const companySizeRange: handleCFn = h =>
  h.push(async ({ data }, _ctx) => {
    try {
      const text = data.brandScaleName

      const [v, err] = rangeMatch(text, formData.companySizeRange.value)
      if (!v) {
        throw new CompanySizeError(
          `不匹配的公司规模 [${err}], 预期: ${formData.companySizeRange.value}`,
        )
      }
    }
    catch (e) {
      todayData.companySizeRange++
      throw new CompanySizeError(errorHandle(e))
    }
  })

export const jobContent: handleCFn = h =>
  h.push(async (_, ctx) => {
    try {
      const content = ctx.listData.card?.postDescription
      for (const x of formData.jobContent.value) {
        if (!x) {
          continue
        }
        const re = new RegExp(
          `(?<!(不|无).{0,5})${x}(?!系统|软件|工具|服务)`,
        )
        if (content != null && re.test(content)) {
          if (formData.jobContent.include) {
            return
          }
          throw new JobDescriptionError(`工作内容含有排除关键词 [${x}]`)
        }
      }
      if (formData.jobContent.include) {
        throw new JobDescriptionError('工作内容中不包含关键词')
      }
    }
    catch (e) {
      todayData.jobContent++
      throw new JobDescriptionError(errorHandle(e))
    }
  })

export const hrPosition: handleCFn = h =>
  h.push(async (_, ctx) => {
    try {
      const content = ctx.listData.card?.bossTitle
      for (const x of formData.hrPosition.value) {
        if (!x) {
          continue
        }
        if (content != null && content.trim() === x) {
          if (formData.hrPosition.include) {
            return
          }
          throw new HrPositionError(`Hr职位在黑名单中 ${content}`)
        }
      }
      if (formData.hrPosition.include) {
        throw new HrPositionError(`Hr职位不在白名单中: ${content}`)
      }
    }
    catch (e) {
      todayData.hrPosition++
      throw new HrPositionError(errorHandle(e))
    }
  })

export const jobAddress: handleCFn = h =>
  h.push(async (_, ctx) => {
    try {
      if (formData.jobAddress.value.length === 0) {
        return
      }
      const content = ctx.listData.card?.address.trim()
      for (const x of formData.jobAddress.value) {
        if (!x) {
          continue
        }
        if (content?.includes(x)) {
          return
        }
      }
      throw new JobAddressError(`工作地址不包含关键词: ${content}`)
    }
    catch (e) {
      todayData.jobAddress++
      throw new JobAddressError(errorHandle(e))
    }
  })

export const jobFriendStatus: handleCFn = h =>
  h.push(async (_, ctx) => {
    const content = ctx.listData.card?.friendStatus

    if (content != null && content !== 0) {
      throw new FriendStatusError('已经是好友了')
    }
  })

export const aiFiltering: handleCFn = (h) => {
  const model = modelData.value.find(
    v => formData.aiFiltering.model === v.key,
  )
  if (!model && !formData.aiFiltering.vip) {
    throw new AIFilteringError('没有找到AI筛选的模型')
  }
  const gpt = getGpt(model!, formData.aiFiltering.prompt, formData.aiFiltering.vip)
  if (gpt instanceof SignedKeyLLM) {
    void gpt.checkResume()
  }
  h.push(async (_, ctx) => {
    // const chatInput = chatInputInit(model)
    try {
      const { content, prompt, reasoning_content } = await gpt.message({
        data: {
          data: ctx.listData,
          boss: ctx.bossData,
          card: ctx.listData.card!,
          amap: {
            straightDistance: (ctx.amap?.distance?.straight.distance ?? 0) / 1000,
            drivingDistance: (ctx.amap?.distance?.driving.distance ?? 0) / 1000,
            drivingDuration: (ctx.amap?.distance?.driving.duration ?? 0) / 60,
            walkingDistance: (ctx.amap?.distance?.walking.distance ?? 0) / 1000,
            walkingDuration: (ctx.amap?.distance?.walking.duration ?? 0) / 60,
          },
        },
        amap: formData.amap.enable
          ? `直线距离:${(ctx.amap?.distance?.straight.distance ?? 0) / 1000}km
驾车距离:${(ctx.amap?.distance?.driving.distance ?? 0) / 1000}km
驾车时间:${(ctx.amap?.distance?.driving.duration ?? 0) / 60}分钟
步行距离:${(ctx.amap?.distance?.walking.distance ?? 0) / 1000}km
步行时间:${(ctx.amap?.distance?.walking.duration ?? 0) / 60}分钟`
          : '',
        json: true,
        // onStream: chatInput.handle,
        onPrompt: s => chatBossMessage(ctx, s),
      }, 'aiFiltering')

      ctx.aiFilteringQ = prompt
      if (content == null) {
        return
      }
      const { res, message, rating } = parseFiltering(content)

      ctx.aiFilteringAjson = res || {}
      ctx.aiFilteringAtext = message
      ctx.aiFilteringR = reasoning_content

      // chatInput.end(message)
      if (rating < (formData.aiFiltering.score ?? 10)) {
        throw new AIFilteringError(message)
      }
    }
    catch (e) {
      todayData.jobContent++
      // chatInput.end('Err~')
      throw new AIFilteringError(errorHandle(e))
    }
  })
}

export const activityFilter: handleCFn = h =>
  h.push(async (_, ctx) => {
    try {
      const activeText = ctx.listData.card?.activeTimeDesc
      if (activeText == null || activeText.includes('月') || activeText.includes('年'))
        throw new ActivityError(`不活跃,当前活跃度 [${activeText}]`)
    }
    catch (e) {
      todayData.activityFilter++
      throw new ActivityError(errorHandle(e))
    }
  })

export const customGreeting: handleCFn = (h) => {
  const template = miTem.compile(formData.customGreeting.value)
  const uid = getUserId()
  if (uid == null) {
    ElMessage.error('没有获取到uid,请刷新重试')
    throw new GreetError('没有获取到uid')
  }
  h.push(async (args, ctx) => {
    try {
      if (ctx.bossData == null) {
        const bossData = await requestBossData(ctx.listData.card!)
        ctx.bossData = bossData
      }
      let msg = formData.customGreeting.value
      if (formData.greetingVariable.value && ctx.listData.card) {
        msg = template({
          data: ctx.listData,
          boss: ctx.bossData,
          card: ctx.listData.card,
          amap: {
            straightDistance: (ctx.amap?.distance?.straight.distance ?? 0) / 1000,
            drivingDistance: (ctx.amap?.distance?.driving.distance ?? 0) / 1000,
            drivingDuration: (ctx.amap?.distance?.driving.duration ?? 0) / 60,
            walkingDistance: (ctx.amap?.distance?.walking.distance ?? 0) / 1000,
            walkingDuration: (ctx.amap?.distance?.walking.duration ?? 0) / 60,
          },
        })
      }

      ctx.message = msg

      const buf = new Message({
        form_uid: uid.toString(),
        to_uid: ctx.bossData.data.bossId.toString(),
        to_name: ctx.bossData.data.encryptBossId, // encryptUserId
        content: msg,
      })

      buf.send()
    }
    catch (e) {
      throw new GreetError(errorHandle(e))
    }
  })
}

function chatBossMessage(ctx: logData, msg: string) {
  const d = new Date()
  chatMessages.value.push({
    id: d.getTime(),
    role: 'boss',
    content: msg,
    date: [getCurDay(d), getCurTime(d)],
    name: ctx.listData.brandName,
    avatar: ctx.listData.brandLogo,
  })
}

export const aiGreeting: handleCFn = (h) => {
  const model = modelData.value.find(
    v => formData.aiGreeting.model === v.key,
  )
  if (!model && !formData.aiGreeting.vip) {
    ElMessage.warning('没有找到招呼语的模型')
    return
  }
  const gpt = getGpt(model!, formData.aiGreeting.prompt, formData.aiGreeting.vip)
  if (gpt instanceof SignedKeyLLM) {
    void gpt.checkResume()
  }
  const uid = getUserId()
  if (uid == null) {
    ElMessage.error('没有获取到uid,请刷新重试')
    throw new GreetError('没有获取到uid')
  }
  h.push(async (args, ctx) => {
    // const chatInput = chatInputInit(model)
    try {
      if (ctx.bossData == null) {
        const bossData = await requestBossData(ctx.listData.card!)
        ctx.bossData = bossData
      }
      const { content, prompt, reasoning_content } = await gpt.message({
        data: {
          data: ctx.listData,
          boss: ctx.bossData,
          card: ctx.listData.card!,
          amap: {},
        },
        // onStream: chatInput.handle,
        onPrompt: s => chatBossMessage(ctx, s),
      }, 'aiGreeting')
      ctx.aiGreetingQ = prompt
      if (content == null) {
        return
      }
      ctx.message = content
      ctx.aiGreetingA = content
      ctx.aiGreetingR = reasoning_content
      // chatInput.end(content)
      const buf = new Message({
        form_uid: uid.toString(),
        to_uid: ctx.bossData.data.bossId.toString(),
        to_name: ctx.bossData.data.encryptBossId, // encryptUserId
        content,
      })
      buf.send()
    }
    catch (e) {
      // chatInput.end('Err~')
      throw new GreetError(errorHandle(e))
    }
  })
}

export async function record(_ctx: logData) {
  // TODO: 记录数据
  // const model = modelData.value.filter(v =>
  //   formData.record.model?.includes(v.key),
  // )
  // await requestGpt(model, ctx, {})
}

function errorHandle(e: any): string {
  if (e instanceof Error) {
    return e.message
  }
  return `${e}`
}
