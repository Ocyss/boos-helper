import axios from "axios";
import { llm, llmConf, llmInfo, messageReps } from "./type";

export type conf = llmConf<
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
      incremental_output?: true;
      repetition_penalty?: number;
    };
  }
>;

export const info: llmInfo<conf> = {
  mode: {
    mode: "aliyun",
    label: "通义千问",
    icon: `<svg t="1713627186974" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15358" width="200" height="200"><path d="M918.60992 591.872l-104.67328-183.1936 44.8512-85.99552a23.92064 23.92064 0 0 0 5.24288-29.9008L806.44096 188.8256a24.6784 24.6784 0 0 0-20.1728-11.22304H572.416l-47.86176-83.74272a22.44608 22.44608 0 0 0-17.2032-11.96032h-112.88576a23.92064 23.92064 0 0 0-20.19328 11.96032v4.5056l-106.9056 183.17312H164.88448a23.94112 23.94112 0 0 0-20.93056 11.22304l-59.06432 104.6528a26.9312 26.9312 0 0 0 0 23.9616l106.16832 184.66816-47.84128 83.7632a26.9312 26.9312 0 0 0 0 23.90016l54.5792 95.72352a24.6784 24.6784 0 0 0 20.93056 11.96032h213.85216l51.58912 89.7024a24.6784 24.6784 0 0 0 18.69824 11.9808h121.11872a23.92064 23.92064 0 0 0 20.19328-11.96032l105.43104-184.68864h94.208a26.19392 26.19392 0 0 0 20.19328-12.6976l54.5792-96.4608a23.18336 23.18336 0 0 0 0-25.43616z m-132.34176 11.96032l-54.5792-100.9664-224.31744 395.55072-61.31712-100.92544H221.73696l53.84192-97.95584h114.40128L165.66272 305.50016h117.39136l111.4112-198.90176 56.07424 97.95584-57.56928 100.92544h448.6144L784.7936 405.7088l112.90624 198.12352h-111.4112z" fill="#605BEC" p-id="15359"></path><path d="M502.12864 641.9456l139.83744-224.29696H361.55392l140.57472 224.29696z" fill="#605BEC" p-id="15360"></path></svg>`,
  },
  model: {
    required: true,
    type: "input",
  },
  api_key: {
    required: true,

    type: "input",
  },
  advanced: {
    value: {
      url: {
        type: "input",
      },
      stream: {
        type: "input",
      },
      temperature: {
        type: "input",
      },
      top_p: {
        type: "input",
      },
      top_k: {
        type: "input",
      },
      max_tokens: {
        type: "input",
      },
      enable_search: {
        type: "input",
      },
      incremental_output: {
        type: "input",
      },
      repetition_penalty: {
        type: "input",
      },
    },
    label: undefined,
    desc: undefined,
    alert: "warning",
  },
};
