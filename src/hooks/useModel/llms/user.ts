import type { llmConf, llmInfo } from '../type'

export type userLLMConf = llmConf<
  'user',
  {
    url: string
    header: string
    data: string
    req: string
  }
>

const info: llmInfo<userLLMConf> = {
  mode: {
    mode: 'user',
    label: '自定义',
    disabled: true,
    icon: `<svg t="1713673715970" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5185" width="200" height="200"><path d="M0 512a512 512 0 1 0 1024 0A512 512 0 1 0 0 512z" fill="#722ED1" p-id="5186"></path><path d="M472 592c15.1 0 29 5.3 40 14.1V512h-94.4c9-11 14.4-25.1 14.4-40.5 0-35.3-28.7-64-64-64s-64 28.7-64 64c0 15.4 5.4 29.5 14.4 40.5H224v256c0 17.7 14.3 32 32 32h256v-94.1c-11 8.8-24.9 14.1-40 14.1-35.3 0-64-28.7-64-64s28.7-64 64-64z" fill="#D3ADF7" p-id="5187"></path><path d="M432 472c0 15.1-5.3 29-14.1 40H512v-94.4c11 9 25.1 14.4 40.5 14.4 35.3 0 64-28.7 64-64s-28.7-64-64-64c-15.4 0-29.5 5.4-40.5 14.4V224H256c-17.7 0-32 14.3-32 32v256h94.1c-8.8-11-14.1-24.9-14.1-40 0-35.3 28.7-64 64-64s64 28.7 64 64z" fill="#EFDBFF" p-id="5188"></path><path d="M592 552c0-15.1 5.3-29 14.1-40H512v94.4c-11-9-25.1-14.4-40.5-14.4-35.3 0-64 28.7-64 64s28.7 64 64 64c15.4 0 29.5-5.4 40.5-14.4V800h256c17.7 0 32-14.3 32-32V512h-94.1c8.8 11 14.1 24.9 14.1 40 0 35.3-28.7 64-64 64s-64-28.7-64-64z" fill="#B37FE8" p-id="5189"></path></svg>`,
    desc: '通过模板语言来手动构建请求,获取数据,门槛较高,如果模型不是小众,且效果良好,价格便宜,可联系作者适配',
  },
  url: {
    type: 'input',
    required: true,
  },
  header: { type: 'input', required: true },
  data: { type: 'input', required: true },
  req: { type: 'input', required: true },
}
// export const send = (m: conf) => {
//   const template = miTem.compile(m.data.data);
//   const msg = template({
//     message: JSON.stringify(message).replace(/^(\s|")+|(\s|")+$/g, ""),
//     raw: JSON.stringify(message),
//   });
//   const req = await axios.post(m.data.url, JSON.parse(msg), {
//     headers: m.data.header ? JSON.parse(m.data.header) : undefined,
//     timeout,
//   });
//   if (m.data.mode === "自定义") {
//     const reqTemplate = miTem.compile(`{{${m.data.req}}}`);
//     return reqTemplate(req);
//   }
// };
export const user = {
  info,
}
