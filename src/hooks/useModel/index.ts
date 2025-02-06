import type { cozeLLMConf } from './llms/coze'
import type { moonshotLLMConf } from './llms/moonshot'
import type { openaiLLMConf } from './llms/openai'
import type { userLLMConf } from './llms/user'
import type { llm, prompt } from './type'
import { logger } from '@/utils/logger'
import { getStorage, setStorage } from '@/utils/storage'
import { ElMessage } from 'element-plus'
import { ref, toRaw } from 'vue'
import { coze } from './llms/coze'
import { moonshot } from './llms/moonshot'
import { openai } from './llms/openai'

export const confModelKey = 'conf-model'
export const llms = [openai.info, moonshot.info, coze.info]

export const llmsIcons = llms.reduce((acc, cur) => {
  if (cur.mode.icon)
    acc[cur.mode.mode] = cur.mode.icon
  return acc
}, {} as Record<string, string>)

const modelData = ref<modelData[]>([])

async function init() {
  const data = await getStorage<modelData[]>(confModelKey, [])
  logger.debug('ai模型数据', data)
  modelData.value = data
}

init()

export interface modelData {
  key: string
  name: string
  color?: string
  data?: moonshotLLMConf | userLLMConf | openaiLLMConf | cozeLLMConf
}

function getGpt(model: modelData, template: string | prompt): llm {
  if (!model.data) {
    throw new Error('GPT数据不存在')
  }
  if (Array.isArray(template)) {
    template = [...template].map(v => ({ ...v }))
  }
  try {
    switch (model.data.mode) {
      case 'openai':
        return new openai.Gpt(model.data, template)
      case 'moonshot':
        return new moonshot.Gpt(model.data, template)
      case 'coze':
        return new coze.Gpt(model.data, template)
      case 'user':
        break
    }
  }
  catch (e: any) {
    throw new Error(`GPT构建错误, ${e.message}`)
  }
  throw new Error(`GPT不存在, 可能已删除停止维护, ${model.data.mode}`)
}

async function save() {
  await setStorage(confModelKey, toRaw(modelData.value))
  ElMessage.success('保存成功')
}

export function useModel() {
  return {
    modelData,
    save,
    getGpt,
  }
}
