import type { MaybePromise } from './types'
import { uid } from 'uid'

// 定义消息类型
const REQUEST_TYPE = '@wxtreq-booshelper/messaging'
const RESPONSE_TYPE = '@wxtres-booshelper/messaging'

// 消息配置接口
interface WindowMessagingConfig {
  namespace?: string
}

// 协议映射类型
type ProtocolMap = Record<string, any>

// 消息处理器类型
type MessageHandler<T> = (data: T) => void | Promise<any>

export function defineWindowMessaging<T extends ProtocolMap>(config: WindowMessagingConfig = {}) {
  const namespace = config.namespace ?? 'default'
  const instanceId = uid()

  // 存储消息处理器
  const handlers = new Map<string, MessageHandler<any>>()
  const responseListeners = new Map<string, (response: any) => void>()

  // 发送消息
  function sendMessage<K extends keyof T>(
    type: K,
    data: Parameters<T[K]>[0],
    targetOrigin: string = '*',
  ): Promise<ReturnType<T[K]>> {
    return new Promise((resolve) => {
      const messageId = uid()

      // 设置响应监听器
      const handleResponse = (response: any) => {
        resolve(response)
        responseListeners.delete(messageId)
      }
      responseListeners.set(messageId, handleResponse)

      // 发送消息
      window.postMessage(
        {
          type: REQUEST_TYPE,
          namespace,
          instanceId,
          messageId,
          message: {
            type,
            data,
          },
        },
        targetOrigin,
      )
    })
  }

  // 监听消息
  function onMessage<K extends keyof T>(
    type: K,
    handler: (data: Parameters<T[K]>[0]) => MaybePromise<ReturnType<T[K]>>,
  ) {
    handlers.set(type as string, handler)
    return () => handlers.delete(type as string)
  }

  // 设置消息监听器
  window.addEventListener('message', async (event) => {
    const { data } = event

    // 处理请求消息
    if (data.type === REQUEST_TYPE && data.namespace === namespace) {
      if (data.instanceId === instanceId)
        return
      const handler = handlers.get(data.message.type)
      if (handler) {
        const response = await handler(data.message.data)
        window.postMessage(
          {
            type: RESPONSE_TYPE,
            namespace,
            messageId: data.messageId,
            response,
          },
          event.origin,
        )
      }
    }

    // 处理响应消息
    if (data.type === RESPONSE_TYPE && data.namespace === namespace) {
      const listener = responseListeners.get(data.messageId)
      if (listener) {
        listener(data.response)
      }
    }
  })

  // 清理所有监听器
  function removeAllListeners() {
    handlers.clear()
    responseListeners.clear()
  }

  return {
    sendMessage,
    onMessage,
    removeAllListeners,
  }
}
