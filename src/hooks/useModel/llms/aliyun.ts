import axios from "axios";
import { llm, llmConf, llmInfo, messageReps } from "../type";
import { desc, other } from "../common";

export type aliyunLLMConf = llmConf<
  "aliyun",
  {
    model: string;
    api_key: string;
    advanced: {
      url?: string;
      stream?: boolean;
      temperature?: number;
      top_p?: number;
      top_k?: number;
      max_tokens?: number;
      enable_search?: boolean;
      // incremental_output?: true;
      repetition_penalty?: number;
    };
  } & other
>;

const info: llmInfo<aliyunLLMConf> = {
  mode: {
    mode: "aliyun",
    label: "通义千问",
    disabled: true,
    icon: `<svg t="1713627186974" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15358" width="200" height="200"><path d="M918.60992 591.872l-104.67328-183.1936 44.8512-85.99552a23.92064 23.92064 0 0 0 5.24288-29.9008L806.44096 188.8256a24.6784 24.6784 0 0 0-20.1728-11.22304H572.416l-47.86176-83.74272a22.44608 22.44608 0 0 0-17.2032-11.96032h-112.88576a23.92064 23.92064 0 0 0-20.19328 11.96032v4.5056l-106.9056 183.17312H164.88448a23.94112 23.94112 0 0 0-20.93056 11.22304l-59.06432 104.6528a26.9312 26.9312 0 0 0 0 23.9616l106.16832 184.66816-47.84128 83.7632a26.9312 26.9312 0 0 0 0 23.90016l54.5792 95.72352a24.6784 24.6784 0 0 0 20.93056 11.96032h213.85216l51.58912 89.7024a24.6784 24.6784 0 0 0 18.69824 11.9808h121.11872a23.92064 23.92064 0 0 0 20.19328-11.96032l105.43104-184.68864h94.208a26.19392 26.19392 0 0 0 20.19328-12.6976l54.5792-96.4608a23.18336 23.18336 0 0 0 0-25.43616z m-132.34176 11.96032l-54.5792-100.9664-224.31744 395.55072-61.31712-100.92544H221.73696l53.84192-97.95584h114.40128L165.66272 305.50016h117.39136l111.4112-198.90176 56.07424 97.95584-57.56928 100.92544h448.6144L784.7936 405.7088l112.90624 198.12352h-111.4112z" fill="#605BEC" p-id="15359"></path><path d="M502.12864 641.9456l139.83744-224.29696H361.55392l140.57472 224.29696z" fill="#605BEC" p-id="15360"></path></svg>`,
    desc: `https://help.aliyun.com/zh/dashscope/developer-reference/api-details#602895ef3dtl1`,
  },
  model: {
    required: true,
    type: "select",
    config: {
      placeholder: "qwen-plus",
      options: [
        "qwen-plus",
        "qwen-turbo",
        "qwen-plus",
        "qwen-max",
        "qwen-max-0403",
        "qwen-max-0107",
        "qwen-max-1201",
        "qwen-max-longcontext",
      ].map((item) => ({
        label: item,
        value: item,
      })),
      allowCreate: true,
      filterable: true,
      defaultFirstOption: true,
    },
  },
  api_key: {
    required: true,
    type: "input",
  },
  advanced: {
    value: {
      url: {
        type: "input",
        value:
          "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      },
      stream: {
        type: "switch",
      },
      temperature: {
        type: "slider",
        value: 0.55,
        config: {
          min: 0,
          max: 2,
          step: 0.05,
        },
        desc: "用于控制随机性和多样性的程度。具体来说，temperature值控制了生成文本时对每个候选词的概率分布进行平滑的程度。较高的temperature值会降低概率分布的峰值，使得更多的低概率词被选择，生成结果更加多样化；而较低的temperature值则会增强概率分布的峰值，使得高概率词更容易被选择，生成结果更加确定。",
      },
      top_p: {
        type: "slider",
        value: 0.8,
        config: {
          min: 0,
          max: 1,
          step: 0.1,
        },
        desc: "生成时，核采样方法的概率阈值。例如，取值为0.8时，仅保留累计概率之和大于等于0.8的概率分布中的token，作为随机采样的候选集。取值范围为（0,1.0)，取值越大，生成的随机性越高；取值越低，生成的随机性越低。默认值为0.8。注意，取值不要大于等于1",
      },
      top_k: {
        type: "slider",
        value: 50,
        config: {
          min: 0,
          max: 100,
          step: 1,
        },
        desc: "生成时，采样候选集的大小。例如，取值为50时，仅将单次生成中得分最高的50个token组成随机采样的候选集。取值越大，生成的随机性越高；取值越小，生成的确定性越高。注意：如果top_k参数为空或者top_k的值大于100，表示不启用top_k策略，此时仅有top_p策略生效，默认是空。",
      },
      max_tokens: {
        value: 1500,
        type: "slider",
        config: {
          min: 100,
          max: 2000,
          step: 100,
        },
        desc: desc.max_tokens,
      },
      enable_search: {
        type: "switch",
        value: false,
        desc: "是否使用互联网搜索结果,可能能搜索公司相关的吐槽?未测试~",
      },
      repetition_penalty: {
        type: "slider",
        value: 1.1,
        config: {
          min: 0,
          max: 2,
          step: 0.1,
        },
        desc: "用于控制模型生成时的重复度。提高repetition_penalty时可以降低模型生成的重复度。1.0表示不做惩罚。默认为1.1。",
      },
    },
    label: "高级配置",
    alert: "warning",
    desc: "小白勿动",
  },
  other,
};
export const aliyun = {
  info,
};
