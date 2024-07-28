import axios from "axios";
import { llm, llmConf, llmInfo, messageReps, prompt } from "../type";
import { openai } from "./openai";
import { other } from "../common";
import { OnStream, request } from "@/utils/request";

export type moonshotLLMConf = llmConf<
  "moonshot",
  {
    url: string;
    model: string;
    api_key: string;
    advanced: {
      json?: boolean;
      stream?: boolean;
      temperature?: number;
      top_p?: number;
      presence_penalty?: number;
      frequency_penalty?: number;
    };
  } & other
>;

const info: llmInfo<moonshotLLMConf> = {
  ...openai.info,
  mode: {
    mode: "moonshot",
    label: "Kimi",
    // disabled: true,
    icon: `<svg t="1713627008962" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13473" width="200" height="200"><path d="M1024 0m0 186.197333l0 651.605334q0 186.197333-186.197333 186.197333l-651.605334 0q-186.197333 0-186.197333-186.197333l0-651.605334q0-186.197333 186.197333-186.197333l651.605334 0q186.197333 0 186.197333 186.197333Z" fill="#000000" p-id="13474"></path><path d="M580.181333 459.946667c57.173333 1.322667 104.192 52.352 104.192 115.2v232.533333a2.090667 2.090667 0 0 1-2.133333 2.133333h-99.925333a2.090667 2.090667 0 0 1-2.133334-2.133333l-1.706666-294.016c0-1.28-2.218667-1.493333-2.56-0.298667-13.397333 43.946667-52.736 56.32-99.84 56.32H304.384a2.090667 2.090667 0 0 0-2.090667 2.090667v235.946667a2.090667 2.090667 0 0 1-2.090666 2.090666H194.858667a2.090667 2.090667 0 0 1-2.048-2.133333V241.578667c0-1.152 0.896-2.048 2.048-2.048h105.386666c1.109333 0 2.048 0.896 2.048 2.048v216.32c0 1.152 0.938667 2.133333 2.090667 2.133333h135.253333a2.133333 2.133333 0 0 0 1.877334-1.28l96.896-218.026667a2.090667 2.090667 0 0 1 1.92-1.194666h116.778666c1.493333 0 2.517333 1.578667 1.877334 2.944l-66.261334 142.293333c-19.754667 36.224-34.304 61.866667-67.242666 72.789333-1.194667 0.426667-0.938667 2.432 0.298666 2.432h54.4z" fill="#FFFFFF" p-id="13475"></path><path d="M727.338667 227.968c-11.733333 9.856-19.413333 25.941333-19.413334 50.218667 0 22.741333 7.253333 40.405333 18.133334 50.986666-5.674667 9.386667-11.434667 15.957333-15.786667 19.498667-0.725333 0.554667-0.170667 2.218667 0.725333 2.133333l64.426667-4.693333c14.378667-1.066667 26.709333-6.485333 37.034667-15.744 12.373333-10.496 19.498667-28.544 19.498666-52.181333 0-24.277333-7.125333-40.362667-19.498666-50.218667-11.776-9.813333-26.112-14.762667-43.050667-14.762667-16.298667 0-30.293333 4.949333-42.069333 14.762667z" fill="#007AFF" p-id="13476"></path></svg>`,
    desc: `注册就送15,国产模型对中文支持应该好一些 <a href="https://platform.moonshot.cn/console/api-keys" target="_blank">开通文档</a>`,
  },
  model: {
    config: {
      placeholder: "moonshot-v1-8k",
      options: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"].map(
        (item) => ({
          label: item,
          value: item,
        })
      ),

      allowCreate: true,
      filterable: true,
      defaultFirstOption: true,
    },
    value: "moonshot-v1-8k",
    type: "select",
    required: true,
  },
  url: {
    config: {
      placeholder: "https://api.moonshot.cn",
    },
    value: "https://api.moonshot.cn",
    type: "input",
    required: true,
  },
};

// TODO: 原以为最好写的模型,tm的调用就卡死
class gpt extends openai.gpt {
  constructor(conf: moonshotLLMConf, template: string | prompt) {
    super(conf as never, template);
  }
}

export const moonshot = {
  info,
  gpt,
};
