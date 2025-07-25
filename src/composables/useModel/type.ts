import type {
  ElInput,
  ElInputNumber,
  ElSelectV2,
  ElSlider,
  ElSwitch,
} from 'element-plus'
import { miTem } from 'mitem'

export interface llmMessageData {
  data?: bossZpJobItemData
  boss?: bossZpBossData
  card?: bossZpCardData
  amap?:any
}

export interface llmMessageArgs {
  data: llmMessageData
  onPrompt?: (s: string) => void
  onStream?: (s: string) => void
  json?: boolean
  test?: boolean
}

export abstract class llm<C = any> {
  conf: C
  tem: (object: any) => string
  template: string | prompt
  constructor(conf: C, template: string | prompt) {
    this.conf = conf
    this.template = template

    if (typeof template === 'string') {
      this.tem = miTem.compile(template)
    }
    else {
      if (template.length === 0) {
        throw new Error('多对话提示词不能为空')
      }
      this.tem = miTem.compile(template[template.length - 1].content)
    }
  }

  buildPrompt(data: object | string): prompt {
    if (typeof data === 'string') {
      return [
        {
          content: data,
          role: 'user',
        },
      ]
    }
    else if (Array.isArray(this.template)) {
      const temp = this.template
      temp[temp.length - 1].content = this.tem(data)
      return temp
    }
    else {
      return [
        {
          content: this.tem(data),
          role: 'user',
        },
      ]
    }
  }
  abstract chat(message: string): Promise<string>
  abstract message(args: llmMessageArgs, type: 'aiGreeting' | 'aiFiltering' | 'aiReply'): Promise<messageReps>
}

export interface messageReps<T = string> {
  content?: T
  reasoning_content?: string | null
  prompt?: string
  usage?: { total_tokens: number, input_tokens: number, output_tokens: number }
}

export type llmConf<M extends string, T> = { mode: M } & T

export type formElm =
  | { type: 'input', config?: InstanceType<typeof ElInput>['$props'] }
  | {
    type: 'inputNumber'
    config?: InstanceType<typeof ElInputNumber>['$props']
  }
  | { type: 'slider', config?: InstanceType<typeof ElSlider>['$props'] }
  | { type: 'switch', config?: InstanceType<typeof ElSwitch>['$props'] }
  | { type: 'select', config?: InstanceType<typeof ElSelectV2>['$props'] }

export type llmInfoVal<T, R> = T extends Record<string, unknown>
  ? {
      value: llmInfo<NonNullable<T>>
      label?: string
      desc?: string
      alert: 'success' | 'warning' | 'info' | 'error'
    }
  : {
    value?: T
    label?: string
    desc?: string
  } & formElm & { [K in keyof R]: R[K] }

export type llmInfo<T extends object> = {
  [K in keyof T]-?: K extends 'mode'
    ? {
        mode: T[K]
        label: string
        icon?: string
        desc?: string
        disabled?: boolean
      }
    : llmInfoVal<T[K], undefined extends T[K] ? object : { required: true }>;
}

export type prompt = Array<{
  role: 'system' | 'user' | 'assistant'
  content: string
}>
