<script lang="ts" setup>
import { reactive, toRaw } from "vue";
import { ElButton, ElForm, ElInput, ElCheckbox } from "element-plus";

import { GM_getValue, GM_setValue } from "$";

import { watchThrottled } from "@vueuse/core";

import formItem from "@/components/form/formItem.vue";
import formSelect from "@/components/form/formSelect.vue";
import deepmerge from "@/utils/deepmerge";
import { FormData } from "@/types/formData";

const formDataKey = "web-geek-job-FormData";

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

const formData: FormData = reactive(
  deepmerge<FormData>(defaultFormData, GM_getValue(formDataKey, {}))
);

watchThrottled(
  formData,
  (v) => {
    console.log("formData改变", toRaw(v));
  },
  { throttle: 2000 }
);

function confSaving() {
  const v = toRaw(formData);
  GM_setValue(formDataKey, v);
  console.log("formData保存", toRaw(v));
}
function confReload() {
  const v = deepmerge<FormData>(defaultFormData, GM_getValue(formDataKey, {}));
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
</script>

<template>
  <el-form
    ref="formRef"
    inline
    label-position="left"
    label-width="auto"
    :model="formData"
  >
    <form-item
      v-bind="formData.company"
      v-model:enable="formData.company.enable"
      v-model:include="formData.company.include"
    >
      <formSelect
        v-model:value="formData.company.value"
        v-model:options="formData.company.options"
      />
    </form-item>
    <form-item
      v-bind="formData.jobTitle"
      v-model:enable="formData.jobTitle.enable"
      v-model:include="formData.jobTitle.include"
    >
      <formSelect
        v-model:value="formData.jobTitle.value"
        v-model:options="formData.jobTitle.options"
      />
    </form-item>
    <form-item
      v-bind="formData.jobContent"
      v-model:enable="formData.jobContent.enable"
      v-model:include="formData.jobContent.include"
    >
      <formSelect
        v-model:value="formData.jobContent.value"
        v-model:options="formData.jobContent.options"
      />
    </form-item>
    <form-item
      v-bind="formData.salaryRange"
      v-model:enable="formData.salaryRange.enable"
    >
      <el-input v-model="formData.salaryRange.value" style="width: 240px" />
    </form-item>
    <form-item
      v-bind="formData.companySizeRange"
      v-model:enable="formData.companySizeRange.enable"
    >
      <el-input
        v-model.lazy="formData.companySizeRange.value"
        style="width: 240px"
      />
    </form-item>

    <form-item
      v-bind="formData.customGreeting"
      v-model:enable="formData.customGreeting.enable"
    >
      <el-input
        v-model.lazy="formData.customGreeting.value"
        style="width: 240px"
      />
    </form-item>
    <div>
      <el-checkbox
        v-bind="formData.greetingVariable"
        v-model="formData.greetingVariable.value"
        border
      />
      <el-checkbox
        v-bind="formData.activityFilter"
        v-model="formData.activityFilter.value"
        border
      />
      <el-checkbox
        v-bind="formData.notification"
        v-model="formData.notification.value"
        border
      />
    </div>
  </el-form>
  <div style="margin-top: 15px">
    <el-button
      type="primary"
      help="保存配置，用于后续直接使用当前配置。"
      @click="confSaving"
    >
      保存配置
    </el-button>
    <el-button type="primary" help="重新加载本地配置" @click="confReload">
      重载配置
    </el-button>
    <el-button type="primary" help="互联网就是要分享" @click="confExport">
      导出配置
    </el-button>
    <el-button type="primary" help="互联网就是要分享" @click="confImport">
      导入配置
    </el-button>
    <el-button
      type="primary"
      help="清空配置,不会帮你保存,可以重载恢复"
      @click="confDelete"
    >
      删除配置
    </el-button>
  </div>
</template>

<style lang="scss" scoped></style>
