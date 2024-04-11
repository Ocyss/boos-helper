import { compile, reactive, toRaw, computed, ref } from "vue";

import { GM_getValue, GM_listValues, GM_setValue } from "$";

import { reactiveComputed, watchThrottled } from "@vueuse/core";

import deepmerge from "@/utils/deepmerge";
import { FormData, FormInfoData, Statistics } from "@/types/formData";
import { getCurDay } from "@/utils";
import { logger } from "@/utils/logger";

export const formDataKey = "web-geek-job-FormData";
export const todayKey = "web-geek-job-Today";
export const statisticsKey = "web-geek-job-Statistics";
export const formInfoData: FormInfoData = {
  company: {
    label: "公司名",
    help: "投递工作的公司名一定包含或不包含在当前集合中，模糊匹配，可用于只投或不投某个公司/子公司。",
  },
  jobTitle: {
    label: "工作名",
    help: "投递工作的岗位名一定包含或不包含在当前集合中，模糊匹配，可用于只投或不投某个岗位名。",
  },
  jobContent: {
    label: "工作内容",
    help: "会自动检测上文(不是,不,无需等关键字),下文(系统,工具),例子：【外包,上门,销售,驾照】，如果写着是'不是外包''销售系统'那也不会被排除",
  },
  salaryRange: {
    label: "薪资范围",
    help: "投递工作的薪资范围一定在当前区间中，一定是区间，使用-连接范围。例如：【12-20】",
  },
  companySizeRange: {
    label: "公司规模范围",
    help: "投递工作的公司人员范围一定在当前区间中，一定是区间，使用-连接范围。例如：【500-20000000】",
  },
  customGreeting: {
    label: "自定义招呼语",
    help: "因为boss不支持将自定义的招呼语设置为默认招呼语。开启表示发送boss默认的招呼语后还会发送自定义招呼语, 使用&lt;br&gt;\\n 换行；例子：【你好\\n我...】",
  },
  greetingVariable: {
    label: "招呼语变量",
    help: "使用mitem模板引擎来对招呼语进行渲染;",
  },
  activityFilter: {
    label: "活跃度过滤",
    help: "打开后会自动过滤掉最近未活跃的Boss发布的工作。以免浪费每天的100次机会。",
  },
  notification: {
    label: "发送通知",
    help: "可以在网站管理中打开通知权限,当停止时会自动发送桌面端通知提醒。",
  },
  aiGreeting: {
    label: "AI招呼语",
    help: "即使前面招呼语开了也不会发送，只会发送AI生成的招呼语，让gpt来打招呼真是太棒了，毕竟开场白很重要。",
  },
  aiFiltering: {
    label: "AI过滤",
    help: "根据工作内容让gpt分析过滤，真是太稳健了，不放过任何一个垃圾",
  },
  aiReply: {
    label: "AI回复",
    help: "万一消息太多，回不过来了呢，也许能和AiHR聊到地球爆炸？魔法击败魔法",
  },
};

export const defaultFormData: FormData = {
  company: {
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  jobTitle: {
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  jobContent: {
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  salaryRange: {
    value: "",
    enable: false,
  },
  companySizeRange: {
    value: "",
    enable: false,
  },
  customGreeting: {
    value: "",
    enable: false,
  },
  greetingVariable: {
    value: false,
  },
  activityFilter: {
    value: false,
  },
  notification: {
    value: false,
  },
  aiGreeting: {
    enable: false,
    word: `我现在需要求职，所以请你来写求职招呼语来向boos或hr打招呼，你需要代入我的身份也就是一名求职者.
我的能力：\"我叫xxx,今年xx岁了，我会......\"
要求:
1.我会告诉你岗位信息,你只需要回答招呼语，请优先礼貌为主不要过于使用书信格式而是聊天一样的招呼语，最好能根据岗位信息来改变语气。
2.一定不可以编造能力,我会啥上面写的很清楚了,如果有我没说的技术栈那就是不会,可以展示其他优势.不要乱写
3.我需要你在结束的时候告诉他这是ai生成的内容仅供参考
>>>
岗位名:{{ card.jobName }}
岗位描述:{{ card.postDescription }}
薪酬:{{ card.salaryDesc }}
经验要求:{{ card.experienceName }},学历要求:{{ card.degreeName }}
相关标签:{{ card.jobLabels }}
`,
  },
  aiFiltering: {
    enable: false,
    word: "我想要早九晚五和双休，公司同事们最好年轻一些要有良好的氛围。我不希望岗位有任何的销售性质，我也不会上门去服务。我想要的是加分项而不是扣分项，没早九晚五也没事，我是社畜～",
  },
  aiReply: {
    enable: false,
    word: "",
  },
};

const formData: FormData = reactive(
  deepmerge<FormData>(defaultFormData, GM_getValue(formDataKey, {}))
);

watchThrottled(
  formData,
  (v) => {
    logger.debug("formData改变", toRaw(v));
  },
  { throttle: 2000 }
);

function confSaving() {
  const v = toRaw(formData);
  GM_setValue(formDataKey, v);
  logger.debug("formData保存", toRaw(v));
}
function confReload() {
  const v = deepmerge<FormData>(defaultFormData, GM_getValue(formDataKey, {}));
  deepmerge(formData, v, { clone: false });
  logger.debug("formData已重置");
}
function confExport() {
  alert("请你吃大饼啦...");
}
function confImport() {
  alert("请你吃大饼啦...");
}
function confDelete() {
  deepmerge(formData, defaultFormData, { clone: false });
  logger.debug("formData已清空");
}

export const useConfFormData = () => {
  return {
    confSaving,
    confReload,
    confExport,
    confImport,
    confDelete,
    formDataKey,
    defaultFormData,
    formData,
  };
};
