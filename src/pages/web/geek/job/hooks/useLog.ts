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
  | PublishError
  | JobTitleError
  | CompanyNameError
  | SalaryError
  | CompanySizeError
  | JobDescriptionError
  | UnknownError;
export type logData = {
  jobName?: string; // 岗位名
  companyName?: string; // 公司名
  salary?: string; // 薪资
  experience?: string; // 工作经验
  degree?: string; // 学历要求
  jobLabels?: string[]; // 岗位标签
  companyLabel?: string[]; //公司标签
  companySize?: string; //公司规模
  address?: string; //地址
  card?: JobCard;
  boosData?: BoosData;
  message?: string;
  aiFiltering?: string; //Ai筛选
};
type logState = "info" | "success" | "warning" | "danger";

type log = {
  title: string; // 标题
  state: logState; // 信息,成功,过滤,出错
  state_name: string; // 标签文本
  message?: string; // 显示消息
  data?: logData;
};

const columns: Column<log>[] = [
  {
    key: "title",
    title: "标题",
    dataKey: "title",
    width: 200,
  },
  {
    key: "state",
    title: "状态",
    width: 150,
    align: "center",
    cellRenderer: ({ rowData }) =>
      h(ElTag, { type: rowData.state ?? "primary" }, rowData.state_name),
  },
  {
    key: "message",
    title: "信息",
    dataKey: "message",
    width: 360,
    minWidth: 360,
    align: "left",
  },
];

const dataOld = ref<log[]>([]);
const data = ref<log[]>([
  {
    title: "嘿嘿嘿",
    state: "info",
    state_name: "消息",
    message: "目前没有投递日志啦",
  },
  {
    title: "啦啦啦",
    state: "success",
    state_name: "消息",
    message: "要查看其他日志请点击右上角的悬浮按钮",
  },
]);

export const useLog = () => {
  const add = (title: string, err: logErr, logdata?: logData, msg?: string) => {
    const state = !err ? "success" : err.state;
    const message = msg ?? (err ? err.message : undefined);

    data.value.push({
      title,
      state,
      state_name: err?.name ?? "投递成功",
      message,
      data: logdata,
    });
  };
  const info = (title: string, message: string) => {
    data.value.push({
      title,
      state: "info",
      state_name: "消息",
      message,
      data: undefined,
    });
  };
  const clear = () => {
    dataOld.value = [];
    data.value = [];
  };
  const reset = () => {
    dataOld.value = data.value;
    data.value = [];
  };

  const Row = ({ cells, rowData }: { cells: any; rowData: log }) => {
    // if (rowData.data) return h("div", {}, rowData.data);
    return cells;
  };

  Row.inheritAttrs = false;
  return {
    columns,
    data,
    dataOld,
    clear,
    reset,
    add,
    info,
    Row,
  };
};
