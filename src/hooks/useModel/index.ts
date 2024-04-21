import { GM_getValue, GM_setValue } from "$";
import { logger } from "@/utils/logger";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ref, toRaw } from "vue";
import { openai, openaiLLMConf } from "./llms/openai";
import { user, userLLMConf } from "./llms/user";
import { moonshot, moonshotLLMConf } from "./llms/moonshot";
import { baidu, baiduLLMConf } from "./llms/baidu";
import { aliyun, aliyunLLMConf } from "./llms/aliyun";
import { llm, prompt } from "./type";

export const confModelKey = "conf-model";
export const llms = [openai.info, moonshot.info, aliyun.info, baidu.info];

const modelData = ref(GM_getValue<modelData[]>(confModelKey, []));
logger.debug("ai模型数据", toRaw(modelData.value));

export type modelData = {
  key: string;
  name: string;
  data?:
    | moonshotLLMConf
    | userLLMConf
    | openaiLLMConf
    | baiduLLMConf
    | aliyunLLMConf;
};

function getGpt(model: modelData, prompt: string | prompt): llm {
  if (!model.data) {
    throw new Error("GPT数据不存在");
  }
  try {
    switch (model.data.mode) {
      case "openai":
        return new openai.gpt(model.data, prompt as string);
      case "moonshot":
        return new moonshot.gpt(model.data, prompt as string);
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
