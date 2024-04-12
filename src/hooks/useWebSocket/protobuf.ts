import protobuf from "protobufjs";
import { TechwolfChatProtocol } from "./type";
import { unsafeWindow } from "$";

var Root = protobuf.Root,
  Type = protobuf.Type,
  Field = protobuf.Field;

// "double" | "float" | "int32" | "uint32" | "sint32" |
// "fixed32" | "sfixed32" | "int64" | "uint64" |
// "sint64" | "fixed64" | "sfixed64" | "string" |
// "bool" | "bytes" | Object
const root = new Root()
  .define("cn.techwolf.boss.chat")
  .add(
    new Type("TechwolfUser")
      .add(new Field("uid", 1, "int64"))
      .add(new Field("name", 2, "string", "optional"))
      .add(new Field("source", 7, "int32", "optional"))
  )
  .add(
    new Type("TechwolfMessageBody")
      .add(new Field("type", 1, "int32"))
      .add(new Field("templateId", 2, "int32", "optional"))
      .add(new Field("headTitle", 11, "string"))
      .add(new Field("text", 3, "string"))
  )
  .add(
    new Type("TechwolfMessage")
      .add(new Field("from", 1, "TechwolfUser"))
      .add(new Field("to", 2, "TechwolfUser"))
      .add(new Field("type", 3, "int32"))
      .add(new Field("mid", 4, "int64", "optional"))
      .add(new Field("time", 5, "int64", "optional"))
      .add(new Field("body", 6, "TechwolfMessageBody"))
      .add(new Field("cmid", 11, "int64", "optional"))
  )
  .add(
    new Type("TechwolfChatProtocol")
      .add(new Field("type", 1, "int32"))
      .add(new Field("messages", 3, "TechwolfMessage", "repeated"))
  );
const AwesomeMessage = root.lookupType("TechwolfChatProtocol");

export class Message {
  msg: Uint8Array;
  hex: string;
  constructor({
    form_uid,
    to_uid,
    to_name,
    content,
  }: {
    form_uid: string;
    to_uid: string;
    to_name: string; // encryptBossId  擦,是boos的id不是岗位的
    content: string;
  }) {
    const r = new Date().getTime();
    const d = r + 68256432452609;
    const data: TechwolfChatProtocol = {
      messages: [
        {
          from: {
            uid: form_uid,
            source: 0,
          },
          to: {
            uid: to_uid,
            name: to_name,
            source: 0,
          },
          type: 1,
          mid: d.toString(),
          time: r.toString(),
          body: {
            type: 1,
            templateId: 1,
            text: content,
          },
          cmid: d.toString(),
        },
      ],
      type: 1,
    };

    this.msg = AwesomeMessage.encode(data).finish().slice();
    this.hex = [...this.msg]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  toArrayBuffer(): ArrayBuffer {
    return this.msg.buffer.slice(0, this.msg.byteLength);
  }
  send() {
    (window.ChatWebsocket || unsafeWindow.ChatWebsocket).send(this);
  }
}
