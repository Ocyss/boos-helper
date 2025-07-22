import protobuf from 'protobufjs'

export interface TechwolfUser {
  //  @int64
  uid: string // 1
  name?: string // 2
  //  @int32
  source?: number // 7
}

export interface TechwolfImageInfo {
  url: string // 1
  // @int32
  width: number // 1
  // @int32
  height: number // 1
}

export interface TechwolfImage {
  // @int64
  iid?: number // 1 测试为空
  tinyImage?: TechwolfImageInfo // 2
  originImage?: TechwolfImageInfo // 3
}

export interface TechwolfMessageBody {
  //  @int32
  type: number // 1
  //  @int32
  templateId: number // 2
  headTitle?: string // 11
  text?: string // 3
  image?: TechwolfImage // 5
}

export interface TechwolfMessage {
  from: TechwolfUser // 1
  to: TechwolfUser // 2
  //  @int32
  type?: number // 3
  //  @int64
  mid?: string // 4
  //  @int64
  time?: string // 5
  body: TechwolfMessageBody // 6
  //  @int64
  cmid?: string // 11
}

export interface TechwolfChatProtocol {
  //  @int32
  type: number // 1
  messages: TechwolfMessage[] // 3
}

const Root = protobuf.Root
const Type = protobuf.Type
const Field = protobuf.Field

// "double" | "float" | "int32" | "uint32" | "sint32" |
// "fixed32" | "sfixed32" | "int64" | "uint64" |
// "sint64" | "fixed64" | "sfixed64" | "string" |
// "bool" | "bytes" | Object
const root = new Root()
  .define('cn.techwolf.boss.chat')
  .add(
    new Type('TechwolfUser')
      .add(new Field('uid', 1, 'int64'))
      .add(new Field('name', 2, 'string', 'optional'))
      .add(new Field('source', 7, 'int32', 'optional')),
  )
  .add(
    new Type('TechwolfImageInfo')
      .add(new Field('url', 1, 'string'))
      .add(new Field('width', 2, 'int32'))
      .add(new Field('height', 3, 'int32')),
  )
  .add(
    new Type('TechwolfImage')
      .add(new Field('iid', 1, 'int64', 'optional'))
      .add(new Field('tinyImage', 2, 'TechwolfImageInfo', 'optional')),
  )
  .add(
    new Type('TechwolfMessageBody')
      .add(new Field('type', 1, 'int32'))
      .add(new Field('templateId', 2, 'int32', 'optional'))
      .add(new Field('headTitle', 11, 'string'))
      .add(new Field('text', 3, 'string'))
      .add(new Field('image', 5, 'TechwolfImage', 'optional')),
  )
  .add(
    new Type('TechwolfMessage')
      .add(new Field('from', 1, 'TechwolfUser'))
      .add(new Field('to', 2, 'TechwolfUser'))
      .add(new Field('type', 3, 'int32'))
      .add(new Field('mid', 4, 'int64', 'optional'))
      .add(new Field('time', 5, 'int64', 'optional'))
      .add(new Field('body', 6, 'TechwolfMessageBody'))
      .add(new Field('cmid', 11, 'int64', 'optional')),
  )
  .add(
    new Type('TechwolfChatProtocol')
      .add(new Field('type', 1, 'int32'))
      .add(new Field('messages', 3, 'TechwolfMessage', 'repeated')),
  )

export const AwesomeMessage = root.lookupType('TechwolfChatProtocol')
