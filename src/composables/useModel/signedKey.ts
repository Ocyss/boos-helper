import type { Client } from '@/stores/signedKey'
import type { components } from '@/types/openapi'
import type { messageReps } from './type'
import { signedKeyReqHandler, useSignedKey } from '@/stores/signedKey'

function transformMessageReps(res: components['schemas']['LLMResponse'], prompt: string): messageReps {
  const ans: messageReps = { prompt }
  ans.content = res.content
  ans.reasoning_content = res.reasoning_content
  ans.usage = {
    input_tokens: res.token_usage.input_tokens,
    output_tokens: res.token_usage.output_tokens,
    total_tokens: res.token_usage.total_tokens,
  }
  return ans
}

export class SignedKeyLLM {
  user_request: string
  client: Client

  constructor(user_request: string) {
    this.user_request = user_request
    this.client = useSignedKey().client
  }

  async checkResume() {
    const res = await this.client.GET('/v1/key/resume')
    const errMsg = signedKeyReqHandler(res)
    if (errMsg != null) {
      throw new Error(errMsg)
    }
  }

  async greetings(data: {
    test?: boolean
    data: {
      data: bossZpJobItemData
      boss?: bossZpBossData
      card: bossZpCardData
    }
  }): Promise<messageReps> {
    const res = await this.client.POST('/v1/llm/invoke/greetings', {
      body: {
        test_mode: data.test ?? false,
        user_request: this.user_request,
        jd: {
          data: data.data.data as any,
          card: data.data.card as any,
          boss: data.data.boss as any,
        },
      },
    })
    const errMsg = signedKeyReqHandler(res, false)
    if (errMsg != null) {
      throw new Error(errMsg)
    }
    if (res.data == null) {
      throw new Error('无LLM响应数据')
    }
    return transformMessageReps(res.data, `用户请求: \n${this.user_request}`)
  }

  async filter(data: {
    test?: boolean
    data: {
      data: bossZpJobItemData
      boss?: bossZpBossData
      card: bossZpCardData
    }
    amap?: string
  }): Promise<messageReps> {
    const res = await this.client.POST('/v1/llm/invoke/filter', {
      body: {
        test_mode: data.test ?? false,
        user_request: this.user_request + data.amap,
        jd: {
          data: data.data.data as any,
          card: data.data.card as any,
          boss: data.data.boss as any,
        },
      },
    })
    const errMsg = signedKeyReqHandler(res, false)
    if (errMsg != null) {
      throw new Error(errMsg)
    }
    if (res.data == null) {
      throw new Error('无LLM响应数据')
    }
    return transformMessageReps(res.data, `用户请求: \n${this.user_request}`)
  }

  async message(data: {
    test?: boolean
    data: {
      data: bossZpJobItemData
      boss?: bossZpBossData
      card: bossZpCardData
    }
    amap?: string
  }, type: 'aiGreeting' | 'aiFiltering' | 'aiReply'): Promise<messageReps> {
    if (type === 'aiGreeting') {
      return this.greetings(data)
    }
    else if (type === 'aiFiltering') {
      return this.filter(data)
    }
    throw new Error('无效的类型')
  }
}
