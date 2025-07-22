import type { TechwolfChatProtocol } from './type'
import { ElMessage } from 'element-plus'
import { AwesomeMessage } from './type'

interface MessageArgs {
  form_uid: string
  to_uid: string
  to_name: string // encryptBossId  擦,boss的id不是岗位的
  content?: string
  image?: string // url
}

export class Message {
  msg: Uint8Array
  hex: string
  args: MessageArgs

  constructor(args: MessageArgs) {
    this.args = args
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
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    return this.msg.buffer.slice(0, this.msg.byteLength) as ArrayBuffer
  }

  send() {
    if (window.ChatWebsocket != null) {
      window.ChatWebsocket.send(this)
    }
    else if (window.EventBus != null) {
      window.EventBus.publish('CHAT_SEND_TEXT', {
        uid: this.args.to_uid,
        encryptUid: this.args.to_name,
        message: this.args.content,
        msg: this.args.content,
      }, () => {
        logger.debug('消息发送成功', this)
      }, () => {
        logger.debug('消息发送失败', this)
      })
    }
    else if (window.__q_chatSend != null) {
      // 当无渠道时，从网络加载临时补丁
      window.__q_chatSend.call(this).then(() => {
        logger.debug('消息发送成功', this)
      }, () => {
        logger.debug('消息发送失败', this)
      })
    }
    else {
      ElMessage.error('无可用发送渠道，请等待作者修复。可暂时关闭招呼语功能')
    }
  }
}
