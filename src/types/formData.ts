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
  goldHunterFilter:FormDataCheckbox;
  notification: FormDataCheckbox;
  aiGreeting: FormDataAi;
  aiFiltering: FormDataAi;
  aiReply: FormDataAi;
  record: { model?: string[]; enable: boolean };
  animation?: "frame" | "card" | "together";
}

export type FormInfoData = {
  [key in keyof FormData]: {
    label: string;
    help?: string;
  };
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
