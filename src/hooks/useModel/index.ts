import { logger } from "@/utils/logger";
import { ElMessage } from "element-plus";
import { ref, toRaw } from "vue";
import { openai, openaiLLMConf } from "./llms/openai";
import { user, userLLMConf } from "./llms/user";
import { moonshot, moonshotLLMConf } from "./llms/moonshot";
import { coze, cozeLLMConf } from "./llms/coze";
import { llm, prompt } from "./type";
import { getStorage, setStorage } from "@/utils/storage";

export const confModelKey = "conf-model";
export const llms = [openai.info, moonshot.info, coze.info];

export const llmsIcons = llms.reduce((acc, cur) => {
  if (cur.mode.icon) acc[cur.mode.mode] = cur.mode.icon;
  return acc;
}, {} as Record<string, string>);

const modelData = ref<modelData[]>([]);


async function init() {
  const data = await getStorage<modelData[]>(confModelKey, []);
  logger.debug("ai模型数据", data);
  modelData.value = data;
}

init()

export type modelData = {
  key: string;
  name: string;
  color?: string;
  data?: moonshotLLMConf | userLLMConf | openaiLLMConf | cozeLLMConf;
};

function getGpt(model: modelData, template: string | prompt): llm {
  if (!model.data) {
    throw new Error("GPT数据不存在");
  }
  if (Array.isArray(template)) {
    template = [...template].map((v) => ({ ...v }));
  }
  try {
    switch (model.data.mode) {
      case "openai":
        return new openai.gpt(model.data, template);
      case "moonshot":
        return new moonshot.gpt(model.data, template);
      case "coze":
        return new coze.gpt(model.data, template);
      case "user":
        break;
    }
  } catch (e) {
    throw new Error("GPT构建错误");
  }
  throw new Error(`GPT不存在, 可能已删除停止维护, ${model.data.mode}`);
}

async function save() {
  await setStorage(confModelKey, toRaw(modelData.value));
  ElMessage.success("保存成功");
}

export const useModel = () => {
  return {
    modelData,
    save,
    getGpt,
  };
};
