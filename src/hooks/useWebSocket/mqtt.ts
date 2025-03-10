// 因为window.ChatWebsocket的出现,暂时用不到了

import { logger } from '@/utils/logger'

export function encodeLength(len: number) {
  const output = []
  let x = len
  do {
    let encodedByte = x % 128
    x = Math.floor(x / 128)
    if (x > 0) {
      encodedByte |= 128
    }
    output.push(encodedByte)
  } while (x > 0)
  return output
}

export interface UTF8Encoder {
  encode: (str: string) => Uint8Array
}
export interface UTF8Decoder {
  decode: (bytes: Uint8Array) => string
}
export function encodeUTF8String(str: string, encoder: UTF8Encoder) {
  const bytes = encoder.encode(str)
  return [bytes.length >> 8, bytes.length & 0xFF, ...bytes]
}
export function decodeUTF8String(
  buffer: Uint8Array,
  startIndex: number,
  utf8Decoder: UTF8Decoder,
) {
  const bytes = decodeUint8Array(buffer, startIndex)
  if (bytes === undefined) {
    return undefined
  }
  const value = utf8Decoder.decode(bytes)

  return {
    length: bytes.length + 2,
    value,
  }
}
// https://www.npmjs.com/package/@esutils/mqtt-packet
export const mqtt = {
  encode(packet: {
    messageId?: number // only for qos1 and qos2
    payload: Uint8Array
  }): Uint8Array {
    const utf8 = new TextEncoder()
    const variableHeader = [...encodeUTF8String('chat', utf8)]
    if (packet.messageId != null) {
      variableHeader.push(packet.messageId >> 8, packet.messageId & 0xFF)
    }
    let { payload } = packet

    if (typeof payload === 'string') {
      payload = utf8.encode(payload)
    }

    const fixedHeader = [
      (3 << 4) | 3, // 0x00110011 qos1消息，非重传、保留消息
      ...encodeLength(variableHeader.length + payload.length),
    ]

    return Uint8Array.from([...fixedHeader, ...variableHeader, ...payload])
  },
  decode(buffer: Uint8Array, flags = 3) {
    const dup = !!(flags & 8)
    const qos = (flags & 6) >> 1
    const { length: remainingLength, bytesUsedToEncodeLength } = decodeLength(
      buffer,
      1,
    )
    const retain = !!(flags & 1)
    const utf = new TextDecoder('utf-8')
    const topicStart = bytesUsedToEncodeLength + 1
    const decodedTopic = decodeUTF8String(buffer, topicStart, utf)
    if (decodedTopic === undefined) {
      throw new Error('Cannot parse topic')
    }
    const topic = decodedTopic.value

    let id = 0
    let payloadStart = topicStart + decodedTopic.length

    if (qos > 0) {
      const idStart = payloadStart
      try {
        id = parseMessageId(buffer, idStart)
      }
      catch {
        logger.error(`错的id?: `, {
          payloadStart,
          topicStart,
          topic,
          dup,
          qos,
          remainingLength,
          retain,
        })
      }
      payloadStart += 2
    }

    const payload = buffer.subarray(payloadStart)

    const returnPacket = {
      topic,
      payload,
      dup,
      retain,
      qos,
      messageId: id,
    }
    return returnPacket
  },
}
export function decodeLength(buffer: Uint8Array, startIndex: number) {
  let i = startIndex
  let encodedByte = 0
  let value = 0
  let multiplier = 1

  do {
    encodedByte = buffer[i]
    i += 1

    value += (encodedByte & 127) * multiplier

    if (multiplier > 128 * 128 * 128) {
      throw new Error('malformed length')
    }

    multiplier *= 128
  } while ((encodedByte & 128) !== 0)

  return { length: value, bytesUsedToEncodeLength: i - startIndex }
}
export function parseMessageId(buffer: Uint8Array, startIndex: number): number {
  if (startIndex + 2 > buffer.length) {
    throw new Error('Cannot parse messageId')
  }
  return (buffer[startIndex] << 8) | buffer[startIndex + 1]
}
export function decodeUint8Array(
  buffer: Uint8Array,
  startIndex: number,
): Uint8Array | undefined {
  if (startIndex >= buffer.length || startIndex + 2 > buffer.length) {
    return undefined
  }
  const length = (buffer[startIndex] << 8) + buffer[startIndex + 1]
  const bytes = buffer.subarray(startIndex + 2, startIndex + 2 + length)
  return bytes
}
