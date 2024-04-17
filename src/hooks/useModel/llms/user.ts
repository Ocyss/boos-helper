import { miTem } from "mitem";
import { modelData } from "..";

export type conf = {
  mode: "user";
  url: string;
  header: string;
  data: string;
  req: string;
};

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
