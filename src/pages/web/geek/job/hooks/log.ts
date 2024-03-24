import { Column, ElButton, ElTag } from "element-plus";
import { h, ref } from "vue";
import {
  PublishError,
  JobTitleError,
  CompanyNameError,
  SalaryError,
  CompanySizeError,
  JobDescriptionError,
  UnknownError,
  errMap,
} from "./types";

type logErr =
  | null
  | undefined
  | typeof PublishError
  | typeof JobTitleError
  | typeof CompanyNameError
  | typeof SalaryError
  | typeof CompanySizeError
  | typeof JobDescriptionError
  | typeof UnknownError;
type logData = {
  companyName?: string; // 公司名
  salary?: string; // 薪资
  experience?: string; // 工作经验
  degree?: string; // 学历要求
  jobLabels?: string; // 岗位标签
  companyLabel?: string; //公司标签
  address?: string; //地址
};
type logState = "success" | "warning" | "danger";
type log = {
  title: string; // 岗位名
  state: logState; // 成功,过滤,出错
  err: logErr; // 具体错误
  message?: string; // 错误信息
  data?: logData;
};

const states: Record<string, logState> = {
  [PublishError.name]: "danger",
  [JobTitleError.name]: "warning",
  [CompanyNameError.name]: "warning",
  [SalaryError.name]: "warning",
  [CompanySizeError.name]: "warning",
  [JobDescriptionError.name]: "warning",
  [UnknownError.name]: "danger",
};
const columns: Column<log>[] = [
  {
    key: "title",
    title: "岗位名",
    width: 150,
  },
  {
    key: "state",
    title: "状态",
    width: 150,
    align: "center",
    cellRenderer: ({ cellData: name }) => h(ElTag, {}, name),
  },
  {
    key: "message",
    title: "信息",
    cellRenderer: () =>
      h([
        h(ElButton, { size: "small" }, "Edit"),
        h(ElButton, { size: "small", type: "danger" }, "Del"),
      ]),
    width: 150,
    align: "center",
  },
];
const dataOld = ref<log[]>([]);
const data = ref<log[]>([]);

const useLog = () => {
  const addLog = (title: string, err: logErr, logdata?: logData) => {
    const state = !err ? "success" : states[err.name];
    const message = err ? err.message : undefined;
    data.value.push({
      title,
      state,
      err,
      message,
      data: logdata,
    });
  };
  return {
    columns,
    data,
  };
};
