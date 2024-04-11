import { GM_getValue, GM_setValue } from "$";
import { type modelData } from "@/types/formData";
import { logger } from "@/utils/logger";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ref, toRaw } from "vue";

export const confModelKey = "conf-model";

const modelData = ref(GM_getValue<modelData[]>(confModelKey, []));
logger.debug("ai模型数据", toRaw(modelData.value));

async function requestGpt(
  model: modelData,
  message: string
): Promise<string | void> {
  let ans: string | undefined;
  switch (model.data.mode) {
    case "ChatGPT": {
      const res = await axios.post(
        model.data.url + "/v1/chat/completions",
        {
          messages: [
            {
              content: message,
              role: "user",
            },
          ],
          model: model.data.model,
          params: {
            n: 1,
            response_format: { type: "json_object" },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${model.data.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );
      ans = res.data?.choices[0]?.message?.content;
      break;
    }
    case "自定义":
      // TODO: 自定义调用，需要提取响应链
      break;
    case "仅记录": {
      await axios.post(
        model.data.url,
        JSON.parse(
          model.data.data.replace("${MESSAGE}", JSON.stringify(message))
        ),
        {
          headers: model.data.header
            ? JSON.parse(model.data.header)
            : undefined,
        }
      );
      break;
    }
  }
  return ans;
}

function save() {
  GM_setValue(confModelKey, toRaw(modelData.value));
  ElMessage.success("保存成功");
}

export const useModel = () => {
  return {
    modelData,
    save,
    requestGpt,
  };
};
