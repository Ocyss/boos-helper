export type ChatMessages = ChatMessage[]

export interface ChatMessage {
  id: number
  role: 'boos' | 'user' | 'assistant'
  name?: string
  content: string
  date: [string, string]
  avatar: string | ChatAvatar
  url?: string
  data?: Record<string, any>
}

export interface ChatInput {
  role: 'user' | 'assistant'
  name?: string
  content: string
  input: boolean
  avatar?: ChatAvatar
}
export interface ChatAvatar {
  icon?: string
  color?: string
}
