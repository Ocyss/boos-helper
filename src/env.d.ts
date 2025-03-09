interface Window {
  socket: WebSocket
  ChatWebsocket: {
    send: (e: { toArrayBuffer: () => ArrayBuffer }) => void
  }
  _PAGE: {
    isGeekChat: boolean
    // zp_token: string; 7.18 寄！
    userId: number
    identity: number
    encryptUserId: string
    name: string
    showName: string
    tinyAvatar: string
    largeAvatar: string
    token: string
    isHunter: boolean
    clientIP: string
    email: any
    phone: any
    brandName: any
    doubleIdentity: boolean
    recruit: boolean
    agentRecruit: boolean
    industryCostTag: number
    gender: number
    trueMan: boolean
    studentFlag: boolean
    completeDayStatus: boolean
    complete: boolean
    multiExpect: boolean
    uid: number
  }
  Cookie: {
    get: (key: string) => string
  }
  __q_parseGptJson: (json: any) => any
  __q_getStorage: (key: string, defaultValue?: any) => Promise<any>
  __q_setStorage: (key: string, value: any) => Promise<boolean>
  __q_sendMessage: any
  __q_onMessage: any
  __q_notify: any
  __q_jobList: JobList
}

declare const __APP_VERSION__: string
