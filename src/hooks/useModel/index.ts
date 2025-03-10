import type { openaiLLMConf } from './openai'
import type { llm, prompt } from './type'
import { logger } from '@/utils/logger'
import { getStorage, setStorage } from '@/utils/message/storage'
import { ElMessage } from 'element-plus'
import { ref, toRaw } from 'vue'
import { openai } from './openai'

export const confModelKey = 'conf-model'
export const llms = [openai.info]

export const llmsIcons = llms.reduce((acc, cur) => {
  if (cur.mode.icon != null)
    acc[cur.mode.mode] = cur.mode.icon
  return acc
}, {} as Record<string, string>)

const modelData = ref<modelData[]>([])

async function init() {
  const data = await getStorage<modelData[]>(confModelKey, [])
  logger.debug('ai模型数据', data)
  modelData.value = data
}

void init()

export interface modelData {
  key: string
  name: string
  color?: string
  data?: openaiLLMConf
}

export function getGpt(model: modelData, template: string | prompt): llm {
  if (!model.data) {
    throw new Error('GPT数据不存在')
  }
  if (Array.isArray(template)) {
    template = [...template].map(v => ({ ...v }))
  }
  try {
    return new openai.Gpt(model.data, template)
  }
  catch (e: any) {
    throw new Error(`GPT构建错误, ${e.message}`)
  }
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
    init,
  }
}
