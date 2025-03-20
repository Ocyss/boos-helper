import type { openaiLLMConf } from './openai'
import type { llm, prompt } from './type'
import { logger } from '@/utils/logger'
import { getStorage, setStorage } from '@/utils/message/storage'
import { ElMessage } from 'element-plus'
import { ref, toRaw } from 'vue'
import { openai } from './openai'
import { SignedKey, SignedKeyLLM } from './signedKey'

export const confModelKey = 'conf-model'
export const llms = [openai.info]

export const llmsIcons = llms.reduce((acc, cur) => {
  if (cur.mode.icon != null)
    acc[cur.mode.mode] = cur.mode.icon
  return acc
}, {
  vip: `<svg t="1742123680044" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2637" width="22" height="22"><path d="M60.235294 361.411765l744.809412 425.622588A30.117647 30.117647 0 0 1 790.136471 843.294118H173.658353a60.235294 60.235294 0 0 1-59.783529-52.766118L60.235294 361.411765z" fill="#F5C164" p-id="2638" /><path d="M963.764706 361.411765l-53.63953 429.116235A60.235294 60.235294 0 0 1 850.341647 843.294118H233.893647a30.117647 30.117647 0 0 1-14.968471-56.259765L963.764706 361.411765z" fill="#F5C164" p-id="2639" /><path d="M512 240.941176l331.053176 509.289412A60.235294 60.235294 0 0 1 792.545882 843.294118H231.454118a60.235294 60.235294 0 0 1-50.507294-93.06353L512 240.941176z" fill="#FFE09E" p-id="2640" /><path d="M512 240.941176l331.053176 509.289412A60.235294 60.235294 0 0 1 792.545882 843.294118H512V240.941176z" fill="#F9CF7E" p-id="2641" /><path d="M512 210.823529m-60.235294 0a60.235294 60.235294 0 1 0 120.470588 0 60.235294 60.235294 0 1 0-120.470588 0Z" fill="#FFE19F" p-id="2642" /><path d="M963.764706 331.294118m-60.235294 0a60.235294 60.235294 0 1 0 120.470588 0 60.235294 60.235294 0 1 0-120.470588 0Z" fill="#FFE19F" p-id="2643" /><path d="M60.235294 331.294118m-60.235294 0a60.235294 60.235294 0 1 0 120.470588 0 60.235294 60.235294 0 1 0-120.470588 0Z" fill="#FFE19F" p-id="2644" /></svg>`,
} as Record<string, string>)

const _modelData = ref<modelData[]>([])

const modelData = computed({
  get() {
    return _modelData.value.sort((a, b) => (a.vip == null && b.vip != null) ? 1 : -1)
  },
  set(value: modelData[]) {
    _modelData.value = value
  },
})

async function init() {
  const data = await getStorage<modelData[]>(confModelKey, [])
  logger.debug('ai模型数据', data)
  modelData.value.push(...data)
}

void init()

export interface modelData {
  key: string
  name: string
  color?: string
  data?: openaiLLMConf
  vip?: {
    description: string
    price: {
      input: string
      output: string
    }
  }
}

export function getGpt(model: modelData, template: string | prompt, vip = false): llm | SignedKeyLLM {
  if (vip) {
    if (typeof template === 'string') {
      const llm = new SignedKeyLLM(template)
      void llm.checkResume()
      return llm
    }
    else {
      throw new TypeError('VIP模型必须传入字符串')
    }
  }
  if (!model.data && !model.vip) {
    throw new Error('GPT数据不存在')
  }
  if (Array.isArray(template)) {
    template = jsonClone(template)
  }
  try {
    if (model.vip) {
      return new SignedKey(model, template)
    }
    else if (model.data) {
      return new openai.Gpt(model.data, template)
    }
    throw new Error('无GPT模型')
  }
  catch (e: any) {
    throw new Error(`GPT构建错误, ${e.message}`)
  }
}

async function save() {
  await setStorage(confModelKey, toRaw(modelData.value).filter(item => item.vip == null))
  ElMessage.success('保存成功')
}

export function useModel() {
  return {
    modelData,
    save,
    getGpt,
    init,
    SignedKeyLLM,
  }
}
