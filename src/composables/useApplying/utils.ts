import type { FormDataRange } from '@/types/formData'
import { GreetError, PublishError } from '@/types/deliverError'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// const { userInfo } = useStore()

export const sameCompanyKey = 'local:sameCompany'
export const sameHrKey = 'local:sameHr'

export async function requestCard(params: { securityId: string, lid: string }) {
  return axios.get<{
    code: number
    message: string
    zpData: {
      jobCard: bossZpCardData
    }
  }>('https://www.zhipin.com/wapi/zpgeek/job/card.json', {
    params,
    timeout: 5000,
  })
}

export async function requestDetail(params: { securityId: string, lid: string }) {
  const token = window?.Cookie.get('bst')
  if (!token) {
    ElMessage.error('没有获取到token,请刷新重试')
    throw new PublishError('没有获取到token')
  }
  return axios.get<{
    code: number
    message: string
    zpData: bossZpDetailData
  }>('https://www.zhipin.com/wapi/zpgeek/job/detail.json', {
    params: {
      ...params,
      _: Date.now(),
    },
    headers: { Zp_token: token },
    timeout: 5000,
  })
}

export async function sendPublishReq(
  data: bossZpJobItemData,
  errorMsg?: string,
  retries = 3,
) {
  if (retries === 0) {
    throw new PublishError(errorMsg ?? '重试多次失败')
  }
  const url = 'https://www.zhipin.com/wapi/zpgeek/friend/add.json'
  const params = {
    securityId: data.securityId,
    jobId: data.encryptJobId,
    lid: data.lid,
  }
  const token = window?.Cookie.get('bst')
  if (!token) {
    ElMessage.error('没有获取到token,请刷新重试')
    throw new PublishError('没有获取到token')
  }
  try {
    const res = await axios({
      url,
      params,
      method: 'POST',
      headers: { Zp_token: token },
    })
    if (
      res.data.code === 1
      && (Boolean((res.data?.zpData?.bizData?.chatRemindDialog?.content)))
    ) {
      throw new PublishError(
        res.data?.zpData?.bizData?.chatRemindDialog?.content as string,
      )
    }
    if (res.data.code !== 0) {
      throw new PublishError(`状态错误:${res.data.message}`)
    }
    return res.data
  }
  catch (e: any) {
    if (e instanceof PublishError) {
      throw e
    }
    return sendPublishReq(data, e?.message as string, retries - 1)
  }
}

export async function requestBossData(
  card: bossZpCardData,
  errorMsg?: string,
  retries = 3,
): Promise<bossZpBossData> {
  if (retries === 0) {
    throw new GreetError(errorMsg ?? '重试多次失败')
  }
  const url = 'https://www.zhipin.com/wapi/zpchat/geek/getBossData'
  // userInfo.value?.token 不相等！
  const token = window?.Cookie.get('bst')
  if (!token) {
    ElMessage.error('没有获取到token,请刷新重试')
    throw new GreetError('没有获取到token')
  }
  try {
    const data = new FormData()
    data.append('bossId', card.encryptUserId)
    data.append('securityId', card.securityId)
    data.append('bossSrc', '0')
    const res = await axios<{
      code: number
      message: string
      zpData: bossZpBossData
    }>({
      url,
      data,
      method: 'POST',
      headers: { Zp_token: token },
    })
    if (res.data.code !== 0) {
      if (res.data.message === '非好友关系') {
        return await requestBossData(card, '非好友关系', retries - 1)
      }
      throw new GreetError(`状态错误:${res.data.message}`)
    }
    return res.data.zpData
  }
  catch (e: any) {
    if (e instanceof GreetError) {
      throw e
    }
    return requestBossData(card, e?.message as string, retries - 1)
  }
}

export function rangeMatchFormat(
  v: FormDataRange,
  unit: string,
): string {
  return `${v[0]} - ${v[1]} ${unit} ${v[2] ? '严格' : '宽松'}`
}

// 匹配范围
export function rangeMatch(
  rangeStr: string,
  form: FormDataRange,
): boolean {
  if (!rangeStr)
    return false
  let [start, end, mode] = form // mode: true=严格(包含)，false=宽松(重叠)
  if (start > end) {
    [start, end] = [end, start]
  }
  const re = /(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/
  const m = String(rangeStr).match(re)
  if (!m)
    return false

  let inputStart = Number.parseFloat(m[1])
  let inputEnd = Number.parseFloat(m[2] != null ? m[2] : m[1])
  if (!Number.isFinite(inputStart) || !Number.isFinite(inputEnd))
    return false

  if (inputStart > inputEnd) {
    [inputStart, inputEnd] = [inputEnd, inputStart]
  }
  // console.log({
  //     inputStart,inputEnd,start,end
  // })
  if (mode) {
    // 严格：职位范围(input) 完全覆盖 目标范围(form)
    return (start <= inputStart) && (inputEnd <= end)
  }
  else {
    // 宽松：任意重叠（闭区间）
    return Math.max(inputStart, start) <= Math.min(inputEnd, end)
  }
}

export function parseFiltering(content: string) {
  interface Item {
    reason: string
    score: number
  }
  const res = parseGptJson<{
    negative: Item[]
    positive: Item[]
  }>(content)

  const hand = (acc: { score: number, reason: string }, curr: Item) => ({
    score: acc.score + Math.abs(curr.score),
    reason: `${acc.reason}\n${curr.reason}/(${Math.abs(curr.score)}分)`,
  })
  const data = {
    negative: res?.negative?.reduce(hand, { score: 0, reason: '' }),
    positive: res?.positive?.reduce(hand, { score: 0, reason: '' }),
  }

  const rating = (data?.positive?.score ?? 0) - (data?.negative?.score ?? 0)

  const message = `分数${rating}\n消极:${data?.negative?.reason}\n\n积极:${data?.positive?.reason}`

  return { res, message, rating, data }
}

export function errorHandle(e: any): string {
  if (e instanceof Error) {
    return e.message
  }
  return `${e}`
}
