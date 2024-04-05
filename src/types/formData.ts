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
  notification: FormDataCheckbox;
  aiGreeting: FormDataAi;
  // aiFiltering: FormDataAi;
  // aiReply: FormDataAi;
}

export interface FormDataSelect {
  label: string;
  help?: string;
  include: boolean;
  value: string[];
  options: string[];
  enable: boolean;
}
export interface FormDataInput {
  label: string;
  help?: string;
  value: string;
  enable: boolean;
}
export interface FormDataCheckbox {
  label: string;
  help?: string;
  value: boolean;
}
export interface FormDataAi {
  label: string;
  model?: string;
  word: string;
  enable: boolean;
}

export type modelData = {
  key: string;
  name: string;
  default: boolean;
  data:
    | {
        mode: "ChatGPT";
        url: string;
        model: string;
        apiKey: string;
      }
    | {
        mode: "自定义";
        url: string;
        header: string;
        data: string;
      }
    | {
        mode: "仅记录";
        url: string;
        header: string;
        data: string;
        wait: boolean;
      };
};
