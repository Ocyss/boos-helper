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
