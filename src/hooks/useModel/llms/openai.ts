import axios from "axios";
import { llm, llmInfo, messageReps } from "./type";

export type conf = {
  mode: "openai";
  url: string;
  model: string;
  apiKey: string;
  advanced?: {
    json?: boolean;
    temperature?: number;
    top_p?: number;
    max_content?: number;
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  };
};
export const info: llmInfo<conf> = {
  mode: {
    value: "openai",
  },
  url: {
    value: "",
  },
  model: {
    value: "",
  },
  apiKey: {
    value: "",
  },
  advanced: {
    value: {
      json: {
        value: false,
      },
      temperature: {
        value: 0,
      },
      top_p: {
        value: 0,
      },
      max_content: {
        value: 0,
      },
      max_tokens: {
        value: 0,
      },
      presence_penalty: {
        value: 0,
      },
      frequency_penalty: {
        value: 0,
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
          Authorization: `Bearer ${this.conf.apiKey}`,
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
