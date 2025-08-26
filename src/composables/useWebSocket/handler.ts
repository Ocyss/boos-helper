import chatProto from '@/assets/chat.proto?raw'
import protobuf from 'protobufjs'

// User 相关类型定义
interface TechwolfUser {
  uid: number
  name?: string
  avatar?: string
  company?: string
  headImg?: number
  certification?: number
  source: number
}

// Image 相关类型定义
interface TechwolfImageInfo {
  url: string
  width: number
  height: number
}

interface TechwolfImage {
  iid?: number
  tinyImage?: TechwolfImageInfo
  originImage?: TechwolfImageInfo
}

// MessageBody 类型定义
interface TechwolfMessageBody {
  type: number
  templateId: number
  headTitle?: string
  text?: string
  sound?: any
  image?: TechwolfImage
  action?: any
  articles?: Array<any>
  notify?: any
  dialog?: any
  jobDesc?: any
  resume?: any
  redEnvelope?: any
  orderDetail?: any
  hyperLink?: any
  video?: any
  interview?: any
  jobShare?: any
  resumeShare?: any
  atInfo?: any
  sticker?: any
  chatShare?: any
  interviewShare?: any
  listCard?: any
  starRate?: any
  frame?: any
  multiImage?: any
  extend?: string
  style?: number
  comDesc?: any
}

// 创建文本消息的参数类型
interface CreateTextMessageData {
  tempID: number
  isSelf: boolean
  from: {
    uid: number
    name: string
    avatar: string
    encryptUid?: string
    source?: number
  }
  to: {
    source: number
    uid: number
    encryptUid: string
  }
  time: number
  body: {
    type: number
    text: string
  }
  mSource: string
  typeSource: string
  type: number
}

// 创建图片消息的参数类型
interface CreateImageMessageData {
  tempID: number
  isSelf: boolean
  from: {
    uid: number
    name: string
    avatar: string
    encryptUid?: string
    source?: number
  }
  to: {
    source: number
    uid: number
    encryptUid: string
  }
  time: number
  body: {
    image: {
      originImage: {
        width: number
        height: number
        url: string
      }
      tinyImage: {
        width: number
        height: number
        url: string
      }
    }
    type: number
    templateId: number
  }
  mSource: string
  typeSource: string
  type: number
}

class ChatProtobufHandler {
  build:any
  chatProto?:protobuf.Root

  constructor() {
    this.build = {}
  }

  async init() {
    this.chatProto = await protobuf.load(chatProto)
    if (this.chatProto) {
      this.build = {
        chatProtocol: this.chatProto.lookupType('TechwolfChatProtocol'),
        message: this.chatProto.lookupType('TechwolfMessage'),
        messageSync: this.chatProto.lookupType('TechwolfMessage'),
        messageRead: this.chatProto.lookupType('TechwolfMessageRead'),
        presence: this.chatProto.lookupType('TechwolfPresence'),
        user: this.chatProto.lookupType('TechwolfUser'),
        body: this.chatProto.lookupType('TechwolfMessageBody'),
        clientInfo: this.chatProto.lookupType('TechwolfClientInfo'),
        kvEntry: this.chatProto.lookupType('TechwolfKVEntry'),
        iq: this.chatProto.lookupType('TechwolfIq'),
        iqResponse: this.chatProto.lookupType('TechwolfIqResponse'),
      }
    }
  }

  createChatProtocol(type:number) {
    const protocol = this.build.chatProtocol.create()
    protocol.type = type
    return protocol
  }

  createMessage(type: number, messageId: number, from: TechwolfUser, to: TechwolfUser, body: TechwolfMessageBody) {
    const message = this.build.message.create()
    message.type = type
    message.mid = messageId
    message.cmid = messageId
    message.from = from
    message.to = to
    message.body = body
    return message
  }

  createUser(uid: number, name?: string, source = 0): TechwolfUser {
    const user = this.build.user.create()
    user.source = source
    user.uid = uid || 0
    if (uid && name) {
      user.name = name
    }
    return user
  }

  createBody(type: number, templateId = 1): TechwolfMessageBody {
    const body = this.build.body.create()
    body.type = type
    body.templateId = templateId
    return body
  }

  createTextMessage(data: CreateTextMessageData) {
    const from = this.createUser(data.from.uid, data.from.encryptUid, data.from.source)
    const to = this.createUser(data.to.uid, data.to.encryptUid, data.to.source)
    const body = this.createBody(1, 1)

    body.text = data.body.text

    const message = this.createMessage(data.type || 1, data.tempID, from, to, body)
    const protocol = this.createChatProtocol(1)
    protocol.messages = [message]

    return protocol
  }

  createImageMessage(data: CreateImageMessageData) {
    const from = this.createUser(data.from.uid, data.from.encryptUid, data.from.source)
    const to = this.createUser(data.to.uid, data.to.encryptUid, data.to.source)
    const body = this.createBody(3, 1)

    body.image = data.body.image

    const message = this.createMessage(data.type || 1, data.tempID, from, to, body)
    const protocol = this.createChatProtocol(1)
    protocol.messages = [message]

    return protocol
  }

}

export default ChatProtobufHandler
