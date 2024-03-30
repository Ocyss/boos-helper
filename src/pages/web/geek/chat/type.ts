export interface TechwolfUser {
  //  @int64
  uid: string; // 1
  name?: string; // 2
  //  @int32
  source?: number; // 7
}

export interface TechwolfMessageBody {
  //  @int32
  type: number; // 1
  //  @int32
  templateId: number; // 2
  headTitle?: string; // 11
  text: string; // 3
}

export interface TechwolfMessage {
  from: TechwolfUser; // 1
  to: TechwolfUser; // 2
  //  @int32
  type?: number; // 3
  //  @int64
  mid?: string; // 4
  //  @int64
  time?: string; // 5
  body: TechwolfMessageBody; // 6
  //  @int64
  cmid?: string; // 11
}

export interface TechwolfChatProtocol {
  //  @int32
  type: number; // 1
  messages: TechwolfMessage[]; // 3
}
