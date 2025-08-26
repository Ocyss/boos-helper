// @ts-nocheck

import chatProto from '@/assets/chat.proto'
import protobuf from 'protobufjs'

function mergeObjects(target, ...sources) {
  for (const source of sources) {
    if (source) {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}

class ChatProtobufHandler {
  constructor() {
    this.chatProto = null
    this.build = {}
    this.init()
  }

  init() {
    if (typeof protobuf === 'undefined') {
      throw new TypeError('protobuf.js is not present.')
    }

    this.chatProto = protobuf.load(chatProto)
    if (this.chatProto) {
      this.initBuild()
    }
  }

  initBuild() {
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

  decode(data) {
    return this.build.chatProtocol.decode(data)
  }

  createChatProtocol(type) {
    const protocol = this.build.chatProtocol.create()
    protocol.type = type
    return protocol
  }

  createMessage(type, messageId, from, to, body) {
    const message = this.build.message.create()
    message.type = type
    message.mid = messageId
    message.cmid = messageId
    message.from = from
    message.to = to
    message.body = body
    return message
  }

  createMessageSync(clientMid, serverMid) {
    const sync = this.build.messageSync.create()
    sync.clientMid = clientMid
    sync.serverMid = serverMid
    return sync
  }

  createMessageRead(userId, messageId, source = 0) {
    const parsedUserId = Number.parseInt(userId, 10)
    if (!userId || Number.isNaN(parsedUserId)) {
      throw new TypeError('userId must be a valid number')
    }

    const read = this.build.messageRead.create()
    read.userId = parsedUserId
    read.userSource = source
    read.messageId = messageId
    read.readTime = Date.now()
    return read
  }

  createPresence(data) {
    const presence = this.build.presence.create()
    const clientInfo = this.build.clientInfo.create()

    presence.uid = window._PAGE?.uid || 0
    presence.type = data.type
    presence.lastMessageId = data.lastMessageId

    const info = data.clientInfo
    clientInfo.version = info.version
    clientInfo.system = info.system
    clientInfo.systemVersion = info.systemVersion
    clientInfo.model = info.model
    clientInfo.uniqid = info.uniqid
    clientInfo.network = info.network
    clientInfo.appid = info.appid
    clientInfo.platform = info.platform
    clientInfo.channel = info.channel
    clientInfo.ssid = info.ssid
    clientInfo.bssid = info.bssid
    clientInfo.longitude = info.longitude
    clientInfo.latitude = info.latitude

    presence.clientInfo = clientInfo
    return presence
  }

  createUser(uid, name, source = 0) {
    const user = this.build.user.create()
    user.source = source
    user.uid = uid || 0
    if (uid && name) {
      user.name = name
    }
    return user
  }

  createBody(type, templateId) {
    const body = this.build.body.create()
    body.type = type
    body.templateId = templateId
    return body
  }

  createIq(params) {
    const iq = this.build.iq.create()
    iq.params = params
    iq.qid = 1
    iq.query = '/message/suggest'
    return iq
  }

  createTextMessage(data:{
    tempID: number
    isSelf: boolean
    from: {
      uid: number
      name: string
      avatar: string
      encryptUid?:string
      source?:number
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
  }) {
    const from = this.createUser(data.from.uid, data.from.encryptUid, data.from.source)
    const to = this.createUser(data.to.uid, data.to.encryptUid, data.to.source)
    const body = this.createBody(1, 1)

    body.text = data.body.text

    const message = this.createMessage(data.type || 1, data.tempID, from, to, body)
    const protocol = this.createChatProtocol(1)
    protocol.messages = [message]

    return protocol
  }

  createActionMessage(data) {
    const from = this.createUser(data.from.uid, data.from.encryptUid, data.from.source)
    const to = this.createUser(data.to.uid, data.to.encryptUid, data.to.source)
    const body = this.createBody(4, 1)

    body.text = data.body.text
    body.action = data.body.action

    const message = this.createMessage(data.type || 1, data.tempID, from, to, body)
    const protocol = this.createChatProtocol(1)
    protocol.messages = [message]

    return protocol
  }

  createGraphicMessage(data) {
    const from = this.createUser(data.from.uid, data.from.encryptUid, data.from.source)
    const to = this.createUser(data.to.uid, data.to.encryptUid, data.to.source)
    const body = this.createBody(20, 1)

    body.text = data.body.text
    body.sticker = data.body.sticker

    const message = this.createMessage(data.type || 1, data.tempID, from, to, body)
    const protocol = this.createChatProtocol(1)
    protocol.messages = [message]

    return protocol
  }

  createSyncMessage(data) {
    const sync = this.createMessageSync(data.clientMid, data.serverMid)
    const protocol = this.createChatProtocol(5)
    protocol.messageSync = [sync]

    return protocol
  }

  createReadMessage(data) {
    const read = this.createMessageRead(data.uid, data.mid, data.source)
    const protocol = this.createChatProtocol(6)
    protocol.messageRead = [read]

    return protocol
  }

  createPresenceMessage(data) {
    const presence = this.createPresence(data)
    const protocol = this.createChatProtocol(2)
    protocol.presence = presence

    return protocol
  }

  createImageMessage(data:{
    tempID: number
    isSelf: boolean
    from: {
      uid: number
      name: string
      avatar: string
      encryptUid?:string
      source?:number
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
  }) {
    const from = this.createUser(data.from.uid, data.from.encryptUid, data.from.source)
    const to = this.createUser(data.to.uid, data.to.encryptUid, data.to.source)
    const body = this.createBody(3, 1)

    body.image = data.body.image

    const message = this.createMessage(data.type || 1, data.tempID, from, to, body)
    const protocol = this.createChatProtocol(1)
    protocol.messages = [message]

    return protocol
  }

  createIqMessage(data) {
    const iq = this.createIq(data)
    const protocol = this.createChatProtocol(3)
    protocol.iq = iq

    return protocol
  }

  createMessageSuggest(data) {
    return this.createIqMessage(mergeObjects({}, data, { query: '/message/suggest' }))
  }
}

export default ChatProtobufHandler
