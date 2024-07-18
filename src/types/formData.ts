import { prompt } from "@/hooks/useModel/type";

export interface Statistics {
  date: string;
  success: number;
  total: number;
  company: number;
  jobTitle: number;
  jobContent: number;
  salaryRange: number;
  companySizeRange: number;
  activityFilter: number;
  goldHunterFilter: number;
  repeat: number;
}

export interface FormData {
  company: FormDataSelect;
  jobTitle: FormDataSelect;
  jobContent: FormDataSelect;
  salaryRange: FormDataInput;
  companySizeRange: FormDataInput;
  customGreeting: FormDataInput;
  greetingVariable: FormDataCheckbox;
  activityFilter: FormDataCheckbox;
  friendStatus: FormDataCheckbox;
  goldHunterFilter: FormDataCheckbox;
  notification: FormDataCheckbox;
  aiGreeting: FormDataAi;
  aiFiltering: FormDataAi;
  aiReply: FormDataAi;
  record: { model?: string[]; enable: boolean };
  // animation?: "frame" | "card" | "together";
  delay: ConfDelay;
}

export type FormInfoData = {
  [key in keyof Omit<FormData, "aiGreeting" | "aiFiltering" | "delay">]: {
    label: string;
    help?: string;
  };
} & {
  aiGreeting: FormInfoAi;
  aiFiltering: FormInfoAi;
  delay: ConfInfoDelay;
};

export type FormInfoAi = {
  label: string;
  help?: string;
  example: [string, prompt];
};
export interface FormDataSelect {
  include: boolean;
  value: string[];
  options: string[];
  enable: boolean;
}
export interface FormDataInput {
  value: string;
  enable: boolean;
}
export interface FormDataCheckbox {
  value: boolean;
}

export interface FormDataAi {
  model?: string;
  prompt: string | prompt;
  enable: boolean;
}

type ConfDelay = {
  deliveryStarts: number;
  deliveryInterval: number;
  deliveryPageNext: number;
  messageSending: number;
};

type ConfInfoDelay = {
  [Key in keyof ConfDelay]: {
    label: string;
    help?: string;
  };
};
