import type { TechwolfChatProtocol } from './type'
import { AwesomeMessage } from './type'

export class Message {
  msg: Uint8Array
  hex: string
  constructor(args: {
    form_uid: string
    to_uid: string
    to_name: string // encryptBossId  擦,是boos的id不是岗位的
    content?: string
    image?: string // url
  }) {
    const r = new Date().getTime()
    const d = r + 68256432452609
    const data: TechwolfChatProtocol = {
      messages: [
        {
          from: {
            uid: args.form_uid,
            source: 0,
          },
          to: {
            uid: args.to_uid,
            name: args.to_name,
            source: 0,
          },
          type: 1,
          mid: d.toString(),
          time: r.toString(),
          body: {
            type: 1,
            templateId: 1,
            text: args.content,
            // image: {},
          },
          cmid: d.toString(),
        },
      ],
      type: 1,
    }

    this.msg = AwesomeMessage.encode(data).finish().slice()
    this.hex = [...this.msg]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  toArrayBuffer(): ArrayBuffer {
    return this.msg.buffer.slice(0, this.msg.byteLength) as ArrayBuffer
  }

  send() {
    window.ChatWebsocket.send(this)
  }
}
