import { miTem } from "mitem";
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

export type llmInfo<T> = {
  [K in keyof T]-?: T[K] extends Object
    ? { value: T[K]; label?: string; desc?: string }
    : { value: llmInfo<NonNullable<T[K]>>; label?: string; desc?: string };
};
