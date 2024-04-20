import axios from "axios";
import { llm, llmConf, llmInfo, messageReps } from "./type";

export type conf = llmConf<
  "openai",
  {
    url: string;
    model: string;
    api_key: string;
    advanced: {
      json?: boolean;
      stream?: boolean;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      presence_penalty?: number;
      frequency_penalty?: number;
    };
  }
>;

export const info: llmInfo<conf> = {
  mode: {
    mode: "openai",
    label: "ChatGPT",
    desc: "GPT4.0效果较好但价格更贵,使用GPT3.5需要根据自身情况去优化提示词也能达到良好效果推荐阅读<a href='https://langgptai.feishu.cn/wiki/RXdbwRyASiShtDky381ciwFEnpe' target='_blank'>《LangGPT》</a>的提示词文档学习",
    icon: `<svg t="1713626988189" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12440" width="200" height="200"><path d="M815.616 0H208.384C93.3 0 0 94.068 0 210.083v603.834C0 929.955 93.3 1024 208.384 1024h607.232C930.7 1024 1024 929.955 1024 813.917V210.083C1024 94.068 930.7 0 815.616 0z" fill="#10A37F" p-id="12441"></path><path d="M757.364 460.032A142.825 142.825 0 0 0 745.1 342.807a144.407 144.407 0 0 0-155.462-69.26 142.708 142.708 0 0 0-106.729-47.988h-1.257a144.384 144.384 0 0 0-137.355 99.933 142.755 142.755 0 0 0-95.418 69.237 144.43 144.43 0 0 0 17.757 169.262 142.825 142.825 0 0 0 12.241 117.202 144.384 144.384 0 0 0 155.462 69.26A142.755 142.755 0 0 0 541.09 798.44h1.28a144.337 144.337 0 0 0 137.356-100.003 142.732 142.732 0 0 0 95.418-69.237 144.198 144.198 0 0 0-17.78-169.192zM542.022 760.995h-0.163a107.148 107.148 0 0 1-68.562-24.855 69.857 69.857 0 0 0 3.375-1.932l114.06-65.862a18.548 18.548 0 0 0 9.379-16.128v-160.93l48.22 27.833a1.722 1.722 0 0 1 0.932 1.327v133.19a107.497 107.497 0 0 1-107.241 107.357z m-230.68-98.514a107.148 107.148 0 0 1-12.8-71.936l3.398 2.002 114.037 65.885a18.595 18.595 0 0 0 18.758 0l139.264-80.407v55.784a1.745 1.745 0 0 1-0.699 1.374l-115.293 66.56a107.567 107.567 0 0 1-107.334 0 107.497 107.497 0 0 1-39.33-39.285z m-29.998-249.018a106.985 106.985 0 0 1 55.878-47.08l-0.047 3.956v131.84a18.525 18.525 0 0 0 9.356 16.105l139.264 80.407-48.221 27.834a1.745 1.745 0 0 1-1.63 0.14l-115.316-66.63a107.497 107.497 0 0 1-39.284-146.595z m396.102 92.16l-139.24-80.384 48.197-27.834a1.722 1.722 0 0 1 1.629-0.163l115.316 66.583a107.427 107.427 0 0 1-16.593 193.746V521.704a18.525 18.525 0 0 0-9.31-16.057z m47.988-72.215a171.055 171.055 0 0 0-3.374-2.025L608 365.521a18.618 18.618 0 0 0-18.758 0l-139.24 80.384v-55.761c0-0.535 0.232-1.07 0.698-1.396l115.293-66.514a107.38 107.38 0 0 1 159.441 111.174z m-301.638 99.235l-48.22-27.834a1.699 1.699 0 0 1-0.932-1.327V370.316a107.38 107.38 0 0 1 176.059-82.456 97.135 97.135 0 0 0-3.375 1.932l-114.083 65.885a18.572 18.572 0 0 0-9.356 16.105v0.116l-0.093 160.745z m26.205-56.46L512 440.343l62.022 35.817v71.633L512 583.587l-62.022-35.794V476.16z" fill="#FFFFFF" p-id="12442"></path></svg>`,
  },
  url: {
    desc: "可使用中转/代理API,前提是符合openai的规范,只需要填域名",
    type: "input",
    config: {
      placeholder: "https://api.openai.com",
    },
    required: true,
  },
  model: {
    type: "select",
    required: true,
  },
  api_key: { type: "input", required: true },
  advanced: {
    label: "高级配置",
    alert: "warning",
    desc: "小白勿动",
    value: {
      json: {
        label: "json",
        value: false,
        type: "switch",
      },
      stream: {
        value: false,
        type: "switch",
      },
      temperature: {
        value: 0,
        type: "slider",
      },
      top_p: {
        value: 0,
        type: "slider",
      },
      max_tokens: {
        value: 0,
        type: "slider",
      },
      presence_penalty: {
        value: 0,
        type: "slider",
      },
      frequency_penalty: {
        value: 0,
        type: "slider",
      },
    },
  },
};

export type prompt = Array<{
  role: string;
  content: string;
}>;
export class openaiGpt extends llm<conf> {
  constructor(conf: conf, template: string) {
    super(conf, template);
  }
  async chat(message: string) {
    const res = await this.post(this.buildPrompt(message));
    return res.data?.choices.pop()?.message?.content;
  }
  async message(data: object): Promise<messageReps> {
    const res = await this.post(this.buildPrompt(data));
    return {
      content: res.data?.choices.pop()?.message?.content,
      prompt: res.data?.choices.pop()?.message?.content,
      usage: {
        input_tokens: res.data?.usage.prompt_tokens,
        output_tokens: res.data?.usage.completion_tokens,
        total_tokens: res.data?.usage.total_tokens,
      },
    };
  }
  private buildPrompt(data: object | string): prompt {
    if (typeof data === "string") {
      return [
        {
          content: data,
          role: "user",
        },
      ];
    } else {
      return [
        {
          content: this.tem(data),
          role: "user",
        },
      ];
    }
  }
  private async post(prompt: prompt) {
    const res = await axios.post(
      this.conf.url + "/v1/chat/completions",
      {
        messages: prompt,
        model: this.conf.model,
        // temperature: m.data.temperature || 0.35,
        // TODO: 部分模型不支持json格式，需要判断
        // response_format: false && json ? { type: "json_object" } : undefined,
      },
      {
        headers: {
          Authorization: `Bearer ${this.conf.api_key}`,
          "Content-Type": "application/json",
        },
        timeout: 120000,
      }
    );
    if (res.data?.error) {
      throw new Error(res.data.error.message);
    }
    return res;
  }
}
