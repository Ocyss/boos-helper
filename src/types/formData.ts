import type { prompt } from '@/hooks/useModel/type'

export interface Statistics {
  date: string
  success: number
  total: number
  company: number
  jobTitle: number
  jobContent: number
  hrPosition: number
  jobAddress: number
  salaryRange: number
  amap: number
  companySizeRange: number
  activityFilter: number
  goldHunterFilter: number
  repeat: number
}

export interface FormData {
  company: FormDataSelect
  jobTitle: FormDataSelect
  jobContent: FormDataSelect
  hrPosition: FormDataSelect
  jobAddress: Omit<FormDataSelect, 'include'>
  salaryRange: FormDataInput
  companySizeRange: FormDataInput
  customGreeting: FormDataInput
  deliveryLimit: FormDataInputNumber
  greetingVariable: FormDataCheckbox
  activityFilter: FormDataCheckbox
  friendStatus: FormDataCheckbox
  sameCompanyFilter: FormDataCheckbox
  sameHrFilter: FormDataCheckbox
  goldHunterFilter: FormDataCheckbox
  notification: FormDataCheckbox
  aiGreeting: FormDataAi
  aiFiltering: FormDataAi & { score: number }
  aiReply: FormDataAi
  amap: {
    key: string
    origins: string
    straightDistance: number
    drivingDistance: number
    drivingDuration: number
    walkingDistance: number
    walkingDuration: number
    enable: boolean
  }
  record: { model?: string[], enable: boolean }
  // animation?: "frame" | "card" | "together";
  delay: ConfDelay
  version: string
  userId?: number | string
}

export type FormInfoData = {
  [key in keyof Omit<FormData, 'aiGreeting' | 'aiFiltering' | 'delay' | 'userId' | 'version' | 'amap'>]: {
    'label': string
    'data-help'?: string
  };
} & {
  aiGreeting: FormInfoAi
  aiFiltering: FormInfoAi
  delay: ConfInfoDelay
  amap: {
    [key in keyof FormData['amap']]: {
      'label': string
      'data-help'?: string
    }
  }
}

export interface FormInfoAi {
  'label': string
  'data-help'?: string
  'example': [string, prompt]
}

export interface FormDataSelect {
  include: boolean
  value: string[]
  options: string[]
  enable: boolean
}

export interface FormDataInput {
  value: string
  enable: boolean
}

export interface FormDataInputNumber {
  value: number
}

export interface FormDataCheckbox {
  value: boolean
}

export interface FormDataAi {
  model?: string
  vip?: boolean
  prompt: string | prompt
  enable: boolean
}

interface ConfDelay {
  deliveryStarts: number
  deliveryInterval: number
  deliveryPageNext: number
  messageSending: number
}

type ConfInfoDelay = {
  [Key in keyof ConfDelay]: {
    'label': string
    'data-help'?: string
    'disable'?: boolean
  };
}
