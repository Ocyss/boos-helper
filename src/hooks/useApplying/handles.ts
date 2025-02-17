import type { logData } from '../useLog'
import type { handleCFn } from './index'
import { useStatistics } from '@/hooks/useStatistics'
import {
  ActivityError,
  AIFilteringError,
  CompanyNameError,
  CompanySizeError,
  FriendStatusError,
  GoldHunterError,
  GreetError,
  HrPositionError,
  JobDescriptionError,
  JobTitleError,
  SalaryError,
} from '@/types/deliverError'
import { getCurDay, getCurTime } from '@/utils'
import { parseGptJson } from '@/utils/parse'
import { ElMessage } from 'element-plus'
import { miTem } from 'mitem'
import { useChat } from '../useChat'

import { useConfFormData } from '../useConfForm'

import { useModel } from '../useModel'

import { useUserInfo } from '../useStore'
import { Message } from '../useWebSocket'
import { rangeMatch, requestBossData } from './utils'

const { getUserId } = useUserInfo()
const { chatInputInit, chatMessages } = useChat()
const { modelData, getGpt } = useModel()
const { formData } = useConfFormData()
const { todayData } = useStatistics()

export const communicated: handleCFn = (_h) => {
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
  if (!model) {
    throw new AIFilteringError('没有找到AI筛选的模型')
  }
  const gpt = getGpt(model, formData.aiFiltering.prompt)
  h.push(async (_, ctx) => {
    const chatInput = chatInputInit(model)
    try {
      const { content, prompt } = await gpt.message({
        data: {
          data: ctx.listData,
          boos: ctx.boosData,
          card: ctx.listData.card,
        },
        onStream: chatInput.handle,
        onPrompt: s => chatBoosMessage(ctx, s),
      })
      ctx.aiFilteringQ = prompt
      if (content == null) {
        return
      }
      ctx.aiFilteringAraw = content
      const data = parseGptJson<{
        rating: number
        negative: string[] | string
        positive: string[] | string
      }>(content)
      ctx.aiFilteringAjson = data || {}
      const mg = `分数${data?.rating}\n消极：${data?.negative?.toString()}\n积极：${data?.positive?.toString()}`
      ctx.aiFilteringAtext = content
      chatInput.end(mg)
      if (!data || data.rating == null || data.rating < 40) {
        throw new AIFilteringError(mg)
      }
    }
    catch (e) {
      todayData.jobContent++
      throw new AIFilteringError(errorHandle(e))
    }
    finally {
      chatInput.end('Err~')
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
  if (!uid) {
    ElMessage.error('没有获取到uid,请刷新重试')
    throw new GreetError('没有获取到uid')
  }
  h.push(async (args, ctx) => {
    try {
      const boosData = await requestBossData(ctx.listData.card!)
      ctx.boosData = boosData

      let msg = formData.customGreeting.value
      if (formData.greetingVariable.value && ctx.listData.card) {
        msg = template({ card: ctx.listData.card })
      }
      ctx.message = msg
      const buf = new Message({
        form_uid: uid.toString(),
        to_uid: boosData.data.bossId.toString(),
        to_name: boosData.data.encryptBossId, // encryptUserId
        content: msg,
      })
      buf.send()
    }
    catch (e) {
      throw new GreetError(errorHandle(e))
    }
  })
}

function chatBoosMessage(ctx: logData, msg: string) {
  const d = new Date()
  chatMessages.value.push({
    id: d.getTime(),
    role: 'boos',
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
  if (!model) {
    ElMessage.warning('没有找到招呼语的模型')
    return
  }
  const gpt = getGpt(model, formData.aiGreeting.prompt)
  const uid = getUserId()
  if (!uid) {
    ElMessage.error('没有获取到uid,请刷新重试')
    throw new GreetError('没有获取到uid')
  }
  h.push(async (args, ctx) => {
    const chatInput = chatInputInit(model)
    try {
      const boosData = await requestBossData(ctx.listData.card!)
      const { content, prompt, reasoning_content } = await gpt.message({
        data: {
          data: ctx.listData,
          boos: ctx.boosData,
          card: ctx.listData.card,
        },
        onStream: chatInput.handle,
        onPrompt: s => chatBoosMessage(ctx, s),
      })
      ctx.aiGreetingQ = prompt
      if (content == null) {
        return
      }
      ctx.message = content
      if (reasoning_content != null && reasoning_content.length > 0) {
        ctx.message = `思考过程: ${reasoning_content}\n\n${content}`
      }
      ctx.aiGreetingA = content
      chatInput.end(content)
      const buf = new Message({
        form_uid: uid.toString(),
        to_uid: boosData.data.bossId.toString(),
        to_name: boosData.data.encryptBossId, // encryptUserId
        content,
      })
      buf.send()
    }
    catch (e) {
      throw new GreetError(errorHandle(e))
    }
    finally {
      chatInput.end('Err~')
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
