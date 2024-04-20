import { GM_getValue, GM_setValue } from "$";
import { logger } from "@/utils/logger";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ref, toRaw } from "vue";
import * as mOpenai from "./llms/openai";
import * as mUser from "./llms/user";
import * as mMoonshot from "./llms/moonshot";
import * as mBaidu from "./llms/baidu";
import * as mAliyun from "./llms/aliyun";
import { llm } from "./llms/type";

export const confModelKey = "conf-model";
export const llms = [mOpenai.info, mMoonshot.info, mAliyun.info, mBaidu.info];

const modelData = ref(GM_getValue<modelData[]>(confModelKey, []));
logger.debug("ai模型数据", toRaw(modelData.value));

export type modelData = {
  key: string;
  name: string;
  mode: string;
  data?: mOpenai.conf | mUser.conf;
};

function getGpt(model: modelData, prompt: string): llm {
  if (!model.data) {
    throw new Error("GPT数据不存在");
  }
  try {
    switch (model.data.mode) {
      case "openai":
        return new mOpenai.openaiGpt(model.data, prompt);
      case "user":
        break;
    }
  } catch (e) {
    throw new Error("GPT构建错误");
  }
  throw new Error("GPT不存在");
}

function save() {
  GM_setValue(confModelKey, toRaw(modelData.value));
  ElMessage.success("保存成功");
}

export const useModel = () => {
  return {
    modelData,
    save,
    getGpt,
  };
};
