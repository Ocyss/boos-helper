export * from './protobuf'

import ChatProtobufHandler from './handler'
import { Message } from './protobuf'

window._q_ChatProtobufHandler = ChatProtobufHandler
window._q_ChatProtobufMessage = Message