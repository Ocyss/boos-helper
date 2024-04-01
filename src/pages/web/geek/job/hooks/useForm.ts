import { compile, reactive, toRaw, computed, ref } from "vue";

import { GM_getValue, GM_listValues, GM_setValue } from "$";

import { reactiveComputed, watchThrottled } from "@vueuse/core";

import deepmerge from "@/utils/deepmerge";
import { FormData, Statistics } from "@/types/formData";
import { getCurDay } from "@/utils";

const formDataKey = "web-geek-job-FormData";
const todayKey = "web-geek-job-Today";
const statisticsKey = "web-geek-job-Statistics";

const defaultFormData: FormData = {
  company: {
    label: "公司名",
    help: "投递工作的公司名一定包含或不包含在当前集合中，模糊匹配，可用于只投或不投某个公司/子公司。",
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  jobTitle: {
    label: "工作名",
    help: "投递工作的岗位名一定包含或不包含在当前集合中，模糊匹配，可用于只投或不投某个岗位名。",
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  jobContent: {
    label: "工作内容",
    help: "会自动检测上文(不是,不,无需等关键字),下文(系统,工具),例子：【外包,上门,销售,驾照】，如果写着是'不是外包''销售系统'那也不会被排除",
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  salaryRange: {
    label: "薪资范围",
    help: "投递工作的薪资范围一定在当前区间中，一定是区间，使用-连接范围。例如：【12-20】",
    value: "",
    enable: false,
  },
  companySizeRange: {
    label: "公司规模范围",
    help: "投递工作的公司人员范围一定在当前区间中，一定是区间，使用-连接范围。例如：【500-20000000】",
    value: "",
    enable: false,
  },
  customGreeting: {
    label: "自定义招呼语",
    help: "因为boss不支持将自定义的招呼语设置为默认招呼语。开启表示发送boss默认的招呼语后还会发送自定义招呼语, 使用&lt;br&gt;\\n 换行；例子：【你好\\n我...】",
    value: "",
    enable: false,
  },
  greetingVariable: {
    label: "招呼语变量",
    help: "打开将替换招呼语中的部分单词为对应信息;JOBNAME:岗位名;COMPANYNAME:公司名; BOSSNAME:招聘人",
    value: false,
  },
  activityFilter: {
    label: "活跃度过滤",
    help: "打开后会自动过滤掉最近未活跃的Boss发布的工作。以免浪费每天的100次机会。",
    value: false,
  },
  notification: {
    label: "发送通知",
    help: "可以在网站管理中打开通知权限,当停止时会自动发送桌面端通知提醒。",
    value: false,
  },
};

const todayData = reactiveComputed<Statistics>(() => {
  const date = getCurDay();
  const current = {
    date,
    success: 0,
    total: 0,
    company: 0,
    jobTitle: 0,
    jobContent: 0,
    salaryRange: 0,
    companySizeRange: 0,
    activityFilter: 0,
    repeat: 0,
  };
  const g = GM_getValue(todayKey, current);
  console.log("统计数据:", g);

  if (g.date === date) {
    return g;
  }
  const statistics = GM_getValue(statisticsKey, []);
  GM_setValue(statisticsKey, [g, ...statistics]);
  GM_setValue(todayKey, current);
  return current;
});

const statisticsData = GM_getValue<Statistics[]>(statisticsKey, []);

watchThrottled(
  todayData,
  (v) => {
    GM_setValue(todayKey, v);
  },
  { throttle: 200 }
);

const formData: FormData = reactive(
  deepmerge<FormData>(defaultFormData, GM_getValue(formDataKey, {}))
);

const deliverLock = ref(false);
const deliverStop = ref(false);

watchThrottled(
  formData,
  (v) => {
    console.log("formData改变", toRaw(v));
  },
  { throttle: 2000 }
);

export const useFormData = () => {
  function confSaving() {
    const v = toRaw(formData);
    GM_setValue(formDataKey, v);
    console.log("formData保存", toRaw(v));
  }
  function confReload() {
    const v = deepmerge<FormData>(
      defaultFormData,
      GM_getValue(formDataKey, {})
    );
    deepmerge(formData, v, { clone: false });
    console.log("formData已重置");
  }
  function confExport() {
    alert("请你吃大饼啦...");
  }
  function confImport() {
    alert("请你吃大饼啦...");
  }
  function confDelete() {
    deepmerge(formData, defaultFormData, { clone: false });
    console.log("formData已清空");
  }
  return {
    deliverLock,
    confSaving,
    confReload,
    confExport,
    confImport,
    confDelete,
    formDataKey,
    defaultFormData,
    formData,
    deliverStop,
    todayData,
    statisticsData,
  };
};
