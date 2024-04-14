import { GM_getValue, GM_setValue } from "$";
import { type modelData } from "@/types/formData";
import { logger } from "@/utils/logger";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ref, toRaw } from "vue";
// @ts-ignore
import { miTem } from "mitem";

export const confModelKey = "conf-model";

const modelData = ref(GM_getValue<modelData[]>(confModelKey, []));
logger.debug("ai模型数据", toRaw(modelData.value));

async function requestGpt(
  model: modelData[],
  message: string | object,
  { timeout = 120000, json = false }
): Promise<string | void> {
  let ans: string | undefined;
  for (const m of model) {
    try {
      switch (m.data.mode) {
        case "ChatGPT": {
          const res = await axios.post(
            m.data.url + "/v1/chat/completions",
            {
              messages: [
                {
                  content: message,
                  role: "user",
                },
              ],
              model: m.data.model,
              temperature: m.data.temperature || 0.35,
              // TODO: 部分模型不支持json格式，需要判断
              response_format:
                false && json ? { type: "json_object" } : undefined,
            },
            {
              headers: {
                Authorization: `Bearer ${m.data.apiKey}`,
                "Content-Type": "application/json",
              },
              timeout,
            }
          );
          ans = res.data?.choices[0]?.message?.content;
          break;
        }
        case "自定义":
        case "仅记录": {
          const template = miTem.compile(m.data.data);
          const msg = template({
            message: JSON.stringify(message).replace(/^(\s|")+|(\s|")+$/g, ""),
            raw: JSON.stringify(message),
          });
          const req = await axios.post(m.data.url, JSON.parse(msg), {
            headers: m.data.header ? JSON.parse(m.data.header) : undefined,
            timeout,
          });
          if (m.data.mode === "自定义") {
            const reqTemplate = miTem.compile(`{{${m.data.req}}}`);
            return reqTemplate(req);
          }
          break;
        }
      }
    } catch (e) {
      logger.error("GPT请求错误", e);
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
