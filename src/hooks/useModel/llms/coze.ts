import {
  llm,
  llmConf,
  llmInfo,
  llmMessageArgs,
  messageReps,
  prompt,
} from "../type";
import { desc, other } from "../common";
import { OnStream, request } from "@/utils/request";

export type cozeLLMConf = llmConf<
  "coze",
  {
    access_token: string;
    bot_id: string;
  } & other
>;

const info: llmInfo<cozeLLMConf> = {
  mode: {
    mode: "coze",
    label: "Coze扣子(beta)",
    desc: `不仅可以白嫖，还有一堆实用工具 <a href="https://www.coze.cn/open/oauth/pats" target="_blank">获取access_token</a><br />但效果不太可控，比如无稳定的json输出模型，总是会带其他废话`,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40"><rect width="36" height="36" x="2" y="2" fill="#4D53E8" rx="6"></rect><g filter="url(#icon-menu-logo_svg__a)"><path fill="#fff" fill-rule="evenodd" d="M20.15 7.672c-5.204 0-9.423 4.22-9.423 9.427v3.954H8.464c-2.597 0-3.184 3.643-.719 4.46l2.982.988v1.707c0 1.687 1.775 2.784 3.283 2.03l1.651-.826a.14.14 0 0 1 .196.082c1.338 4.179 7.248 4.179 8.587 0a.14.14 0 0 1 .195-.082l1.652.826c1.508.754 3.283-.343 3.283-2.03v-1.707l2.981-.988c2.466-.817 1.879-4.46-.719-4.46h-2.262v-3.954c0-5.206-4.22-9.427-9.424-9.427Z" clip-rule="evenodd"></path></g><g filter="url(#icon-menu-logo_svg__b)"><path fill="url(#icon-menu-logo_svg__c)" d="M23.343 21.964a.912.912 0 1 1 1.824 0 .912.912 0 0 1-1.825 0Z"></path></g><g filter="url(#icon-menu-logo_svg__d)"><path fill="url(#icon-menu-logo_svg__e)" d="M17.248 25.324a.912.912 0 0 1 1.29-1.29c.89.89 2.333.89 3.224 0a.912.912 0 1 1 1.29 1.29 4.102 4.102 0 0 1-5.804 0Z"></path></g><g filter="url(#icon-menu-logo_svg__f)"><path fill="url(#icon-menu-logo_svg__g)" d="M16.047 20.14a.912.912 0 0 0-.912.912v1.825a.912.912 0 1 0 1.824 0v-1.825a.912.912 0 0 0-.912-.912Z"></path></g><defs><filter id="icon-menu-logo_svg__a" width="30.351" height="27.956" x="4.975" y="6.472" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.6"></feOffset><feGaussianBlur stdDeviation="0.6"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 0.165547 0 0 0 0 0.177065 0 0 0 0 0.463086 0 0 0 0.2 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1054_7681"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.3"></feOffset><feGaussianBlur stdDeviation="0.3"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 0.164706 0 0 0 0 0.176471 0 0 0 0 0.462745 0 0 0 0.1 0"></feColorMatrix><feBlend in2="effect1_dropShadow_1054_7681" result="effect2_dropShadow_1054_7681"></feBlend><feBlend in="SourceGraphic" in2="effect2_dropShadow_1054_7681" result="shape"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1.2"></feOffset><feGaussianBlur stdDeviation="1.2"></feGaussianBlur><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 0.301961 0 0 0 0 0.32549 0 0 0 0 0.909804 0 0 0 0.1 0"></feColorMatrix><feBlend in2="shape" result="effect3_innerShadow_1054_7681"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="-1.2"></feOffset><feGaussianBlur stdDeviation="1.2"></feGaussianBlur><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 0.301961 0 0 0 0 0.32549 0 0 0 0 0.909804 0 0 0 0.15 0"></feColorMatrix><feBlend in2="effect3_innerShadow_1054_7681" result="effect4_innerShadow_1054_7681"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="-1.2"></feOffset><feGaussianBlur stdDeviation="0.9"></feGaussianBlur><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 0.301961 0 0 0 0 0.32549 0 0 0 0 0.909804 0 0 0 0.15 0"></feColorMatrix><feBlend in2="effect4_innerShadow_1054_7681" result="effect5_innerShadow_1054_7681"></feBlend></filter><filter id="icon-menu-logo_svg__b" width="3.624" height="3.925" x="22.442" y="20.302" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.45"></feOffset><feGaussianBlur stdDeviation="0.45"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1054_7681"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="-0.15"></feOffset><feGaussianBlur stdDeviation="0.3"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 0.301961 0 0 0 0 0.32549 0 0 0 0 0.909804 0 0 0 0.4 0"></feColorMatrix><feBlend in2="effect1_dropShadow_1054_7681" result="effect2_dropShadow_1054_7681"></feBlend><feBlend in="SourceGraphic" in2="effect2_dropShadow_1054_7681" result="shape"></feBlend></filter><filter id="icon-menu-logo_svg__d" width="8.138" height="4.86" x="16.081" y="23.016" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.45"></feOffset><feGaussianBlur stdDeviation="0.45"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1054_7681"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="-0.15"></feOffset><feGaussianBlur stdDeviation="0.3"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 0.301961 0 0 0 0 0.32549 0 0 0 0 0.909804 0 0 0 0.4 0"></feColorMatrix><feBlend in2="effect1_dropShadow_1054_7681" result="effect2_dropShadow_1054_7681"></feBlend><feBlend in="SourceGraphic" in2="effect2_dropShadow_1054_7681" result="shape"></feBlend></filter><filter id="icon-menu-logo_svg__f" width="3.624" height="5.749" x="14.235" y="19.39" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.45"></feOffset><feGaussianBlur stdDeviation="0.45"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1054_7681"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="-0.15"></feOffset><feGaussianBlur stdDeviation="0.3"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 0.301961 0 0 0 0 0.32549 0 0 0 0 0.909804 0 0 0 0.4 0"></feColorMatrix><feBlend in2="effect1_dropShadow_1054_7681" result="effect2_dropShadow_1054_7681"></feBlend><feBlend in="SourceGraphic" in2="effect2_dropShadow_1054_7681" result="shape"></feBlend></filter><linearGradient id="icon-menu-logo_svg__c" x1="24.308" x2="24.165" y1="21.357" y2="27.204" gradientUnits="userSpaceOnUse"><stop stop-color="#272DCC"></stop><stop offset="1" stop-color="#9A9DF2"></stop></linearGradient><linearGradient id="icon-menu-logo_svg__e" x1="19.849" x2="19.249" y1="24.65" y2="26.9" gradientUnits="userSpaceOnUse"><stop stop-color="#2B33E6"></stop><stop offset="1" stop-color="#A19AF2"></stop></linearGradient><linearGradient id="icon-menu-logo_svg__g" x1="16.1" x2="15.53" y1="20.75" y2="32.422" gradientUnits="userSpaceOnUse"><stop stop-color="#272DCC"></stop><stop offset="1" stop-color="#9A9DF2"></stop></linearGradient></defs></svg>`,
  },
  access_token: {
    desc: "验证客户端身份的访问令牌",
    type: "input",
    config: {
      placeholder: "pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****",
    },
    required: true,
  },
  bot_id: {
    desc: "进行会话聊天的 Bot ID",
    type: "input",
    config: {
      placeholder: "73428668*****",
    },
    required: true,
  },
  other,
};

class gpt extends llm<cozeLLMConf> {
  constructor(conf: cozeLLMConf, template: string | prompt) {
    super(conf, template);
  }
  async chat(message: string) {
    const res = await this.post({
      prompt: this.buildPrompt(message),
      user_id: "test",
    });
    return res.choices.pop()?.message?.content || "";
  }
  async message({
    data,
    onPrompt = (s: string) => {},
    onStream = (s: string) => {},
    json = false,
  }: llmMessageArgs): Promise<messageReps> {
    const prompts = this.buildPrompt(data);
    const prompt = prompts[prompts.length - 1].content;
    onPrompt(prompt);
    const ans: messageReps = { prompt };

    const res = await this.post({
      prompt: prompts,
      user_id: data?.data?.encryptJobId || "boos-helper",
      onStream: async (stream) => {
        for await (const event of stream) {
          let data: any = {};
          if (event.data) {
            data = JSON.parse(event.data);
          }
          console.log({ ...event, jdata: data });

          switch (event.event) {
            case "conversation.message.delta":
              const content = data.content;
              onStream(content);
              break;
            case "conversation.message.completed":
              if (data.type === "answer") {
                ans.content = data.content;
              }
              break;
            case "conversation.chat.completed":
              if (data.last_error?.code !== 0) {
                throw new Error(data.last_error?.msg ?? "未知错误");
              }
              ans.usage = {
                total_tokens: data.usage?.token_count,
                input_tokens: data.usage?.input_count,
                output_tokens: data.usage?.output_count,
              };
              break;
          }
        }
      },
    });

    return ans;
  }
  private async post(args: {
    prompt: prompt;
    user_id: string;
    onStream?: OnStream;
  }): Promise<any> {
    const res = await request.post({
      url: "https://api.coze.cn/v3/chat",
      data: JSON.stringify({
        bot_id: this.conf.bot_id,
        user_id: args.user_id,
        stream: true,
        auto_save_history: true,
        additional_messages: args.prompt,
      }),
      headers: {
        Authorization: `Bearer ${this.conf.access_token}`,
        "Content-Type": "application/json",
      },
      responseType: "stream",
      timeout: this.conf.other.timeout,
      onStream: args.onStream,
      isFetch: true,
    });
    return res;
  }
}

export const coze = {
  gpt,
  info,
};
