import { llmConf, llmInfo } from "./type";

export type other = {
  other: {
    timeout?: number;
  };
};

export const other: llmInfo<other>["other"] = {
  value: {
    timeout: {
      value: 120000,
      type: "inputNumber",
    },
  },
  alert: "warning",
  label: "其他配置",
};

export const desc = {
  stream: "推荐开启,可以实时查看gpt返回的响应,但如果你的模型不支持,请关闭",
  max_tokens: "用处不大一般不需要调整",
  temperature: "较高的数值会使输出更加随机，而较低的数值会使其更加集中和确定",
  top_p: "影响输出文本的多样性，取值越大，生成文本的多样性越强",
};
