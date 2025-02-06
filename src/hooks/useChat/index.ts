import type { modelData } from '../useModel'
import type { ChatInput, ChatMessages } from './type'
import { getCurDay, getCurTime } from '@/utils'
import { reactive, ref, toRaw } from 'vue'
import { llmsIcons } from '../useModel'

const chatMessages = ref<ChatMessages>([])

const chatInput = reactive<ChatInput>({
  role: 'user',
  content: '',
  input: false,
})

function chatInputInit(model: modelData) {
  chatInput.content = ''
  chatInput.input = true
  chatInput.role = 'assistant'
  chatInput.name = model.name
  chatInput.avatar = {
    icon: llmsIcons[model.data?.mode || ''],
    color: model.color,
  }
  let end = false
  return {
    handle: (s: string) => {
      chatInput.content += s
    },
    end: (s: string) => {
      if (end)
        return
      end = true
      chatInput.input = false
      chatInput.content = s
      const d = new Date()
      chatMessages.value.push({
        id: d.getTime(),
        role: 'assistant',
        content: s,
        date: [getCurDay(d), getCurTime(d)],
        name: chatInput.name,
        avatar: toRaw(chatInput.avatar!),
      })
      chatInput.content = ''
    },
  }
}

export function useChat() {
  return {
    chatMessages,
    chatInput,
    chatInputInit,
  }
}
