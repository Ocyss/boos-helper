import { defineWindowMessaging } from './window'

interface ProtocolMap {
  'storage:get': (data: { key: string }) => any
  'storage:set': (data: { key: string, value: any }) => boolean
}

export const { sendMessage, onMessage } = defineWindowMessaging<ProtocolMap>({
  namespace: `boos-helper/message`,
})
