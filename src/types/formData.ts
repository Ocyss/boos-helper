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
  aiFiltering: FormDataAi;
  aiReply: FormDataAi;
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
