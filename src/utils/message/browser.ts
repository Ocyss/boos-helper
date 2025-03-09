import type { MaybePromise, ProtocolCommonMap } from './types'
import { uid } from 'uid'
import { serializeError, deserializeError } from 'serialize-error';

// 协议映射类型
type ProtocolMap = Record<string, any>

// 消息处理器类型
type MessageHandler<T> = (data: T) => void | Promise<any>

export function defineBrowserMessaging<T extends ProtocolMap>() {
  const instanceId = uid()

  // 存储消息处理器
  const handlers = new Map<string, MessageHandler<any>>()

  // 发送消息
  async function sendMessage<K extends keyof T>(
    type: K,
    data: Parameters<T[K]>[0],
  ): Promise<ReturnType<T[K]>> {
    return await browser.runtime.sendMessage({
      instanceId,
      message: {
        type,
        data,
      },
    }).then((res) => {
      if (res instanceof Error) {
        throw res
      }else if ((res && typeof res === 'object' && "_QError" in res && res._QError)){
        throw deserializeError(res._QError)
      }
      return res as ReturnType<T[K]>
    }).catch((e) => {
      throw e
    })
  }

  function onMessage<K extends keyof T>(
    type: K,
    handler: (data: Parameters<T[K]>[0]) => MaybePromise<ReturnType<T[K]>>,
  ) {
    handlers.set(type as string, handler)
    return () => handlers.delete(type as string)
  }

  browser.runtime.onMessage.addListener(async (data: any) => {
    const handler = handlers.get(data.message.type as string)
    if (handler) {
      try {
        const response = await handler(data.message.data)
        return response
      }
      catch (e: any) {
        return { _QError: serializeError(e) }
      }
    }
    return null
  })

  function removeAllListeners() {
    handlers.clear()
  }

  return {
    sendMessage,
    onMessage,
    removeAllListeners,
  }
}

interface ProtocolBrowserMap extends ProtocolCommonMap {
}

export const { sendMessage: sendBrowserMessage, onMessage: onBrowserMessage } = defineBrowserMessaging<ProtocolBrowserMap>()
