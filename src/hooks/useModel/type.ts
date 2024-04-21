import { miTem } from "mitem";
import {
  ElInput,
  ElInputNumber,
  ElSelectV2,
  ElSlider,
  ElSwitch,
} from "element-plus";

export abstract class llm<C = any, T extends Array<any> = Array<any>> {
  conf: C;
  tem: (object: any) => string;
  template: string;
  constructor(conf: C, template: string) {
    this.conf = conf;
    this.template = template;
    this.tem = miTem.compile(template);
    // if (typeof template === "string") {
    //   this.tem = miTem.compile(template);
    // } else {
    //   this.tem = miTem.compile(template.length)
    // }
  }

  abstract chat(message: string): Promise<string>;
  abstract message(data: object): Promise<messageReps>;
}

export type messageReps<T = string> = {
  content?: T;
  prompt?: string;
  usage?: { total_tokens: number; input_tokens: number; output_tokens: number };
};
export type llmConf<M extends string, T> = { mode: M } & T;

export type formElm =
  | { type: "input"; config?: InstanceType<typeof ElInput>["$props"] }
  | {
      type: "inputNumber";
      config?: InstanceType<typeof ElInputNumber>["$props"];
    }
  | { type: "slider"; config?: InstanceType<typeof ElSlider>["$props"] }
  | { type: "switch"; config?: InstanceType<typeof ElSwitch>["$props"] }
  | { type: "select"; config?: InstanceType<typeof ElSelectV2>["$props"] };

export type llmInfoVal<T, R> = T extends Record<string, unknown>
  ? {
      value: llmInfo<NonNullable<T>>;
      label?: string;
      desc?: string;
      alert: "success" | "warning" | "info" | "error";
    }
  : {
      value?: T;
      label?: string;
      desc?: string;
    } & formElm & { [K in keyof R]: R[K] };

export type llmInfo<T extends Record<string, unknown>> = {
  [K in keyof T]-?: K extends "mode"
    ? {
        mode: T[K];
        label?: string;
        icon?: string;
        desc?: string;
        disabled?: boolean;
      }
    : llmInfoVal<T[K], undefined extends T[K] ? {} : { required: true }>;
};

export type prompt = Array<{
  role: "system" | "user" | "assistant";
  content: string;
}>;
