import type { ProtocolMap } from './types'
import { defineWindowMessaging } from './window'

export const { sendMessage, onMessage } = defineWindowMessaging<ProtocolMap>({
  namespace: `boos-helper/message`,
})

window.__q_sendMessage = sendMessage
window.__q_onMessage = onMessage
