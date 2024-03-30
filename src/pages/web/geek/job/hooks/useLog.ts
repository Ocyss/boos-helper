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
    title: "获取岗位",
    state: "info",
    state_name: "消息",
    message: "本次获取到 30 个",
  },
  {
    title: "数据管理专员（餐饮行业）",
    state: "warning",
    state_name: "岗位名筛选",
    message: "含有排除关键词 [管理]",
    data: {
      jobName: "数据管理专员（餐饮行业）",
      companyName: "四夕餐饮管理有限公司",
      salary: "5-7K",
      companySize: "餐饮不需要融资100-499人",
    },
  },
  {
    title: "嵌入式软件测试工程师",
    state: "warning",
    state_name: "薪资筛选",
    message: "不匹配的范围 [11-20]",
    data: {
      jobName: "嵌入式软件测试工程师",
      companyName: "德赛西威",
      salary: "11-20K·13薪",
      companySize: "汽车零部件已上市1000-9999人",
    },
  },
  {
    title: "富士康高薪招聘6000+",
    state: "warning",
    state_name: "岗位名筛选",
    message: "含有排除关键词 [富士康]",
    data: {
      jobName: "富士康高薪招聘6000+",
      companyName: "富士康科技集团(总部)",
      salary: "6-9K",
      companySize: "其他制造业不需要融资10000人以上",
    },
  },
  {
    title: "暂停投递",
    state: "info",
    state_name: "消息",
    message: "剩余 27 个未处理",
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
