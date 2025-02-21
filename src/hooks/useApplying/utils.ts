import { GreetError, PublishError } from '@/types/deliverError'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// const { userInfo } = useStore()

export async function requestCard(params: { securityId: string, lid: string }) {
  return axios.get<{
    code: number
    message: string
    zpData: {
      jobCard: JobCard
    }
  }>('https://www.zhipin.com/wapi/zpgeek/job/card.json', {
    params,
    timeout: 5000,
  })
}

export async function sendPublishReq(
  data: JobListData,
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
  card: JobCard,
  errorMsg?: string,
  retries = 3,
): Promise<BoosData> {
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
      zpData: BoosData
    }>({
      url,
      data,
      method: 'POST',
      headers: { Zp_token: token },
    })
    if (res.data.code !== 0 && res.data.message !== '非好友关系') {
      throw new GreetError(`状态错误:${res.data.message}`)
    }
    if (res.data.code !== 0)
      return await requestBossData(card, '非好友关系', retries - 1)
    return res.data.zpData
  }
  catch (e: any) {
    if (e instanceof GreetError) {
      throw e
    }
    return requestBossData(card, e?.message as string, retries - 1)
  }
}

// 匹配范围
export function rangeMatch(
  rangeStr: string,
  input?: string,
  mode: 'intersection' | 'subset' = 'subset', // 交集、子集，默认: 子集
  numberHandler: (start: number, end: number) => [number, number] = (start, end) => [start, end],
): [boolean, string] {
  if (!rangeStr) {
    return [false, '无内容']
  }
  // 匹配定义范围的正则表达式
  const reg = /(\d+)(?:-(\d+))?/
  const match = rangeStr.match(reg)
  let err = '预期之外'
  if (match && match.length > 0) {
    err = match[0]
  }
  if (match && input != null) {
    const [start, end] = numberHandler(Number.parseInt(match[1]), Number.parseInt(match[2] || match[1]))

    // 如果输入只有一个数字的情况
    if (/^\d+$/.test(input)) {
      const number = Number.parseInt(input)

      return [number >= start && number <= end, err]
    }

    // 如果输入有两个数字的情况
    const inputReg = /^(\d+)(?:-(\d+))?/
    const inputMatch = input.match(inputReg)
    if (inputMatch) {
      const inputStart = Number.parseInt(inputMatch[1])
      const inputEnd = Number.parseInt(inputMatch[2] || inputMatch[1])
      return [
        // start-end: 15-29 用户输入: inputStart-inputEnd 16-20
        mode === 'subset'
          ? (start >= inputStart && start <= inputEnd) || (end >= inputStart && end <= inputEnd) // 子集
          : !(end < inputStart || inputEnd < start), // 交集
        err,
      ]
    }
  }

  // 其他情况均视为不匹配
  return [false, err]
}
