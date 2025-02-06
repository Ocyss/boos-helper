interface BoosData {
  data: Data
  job: Job
}

interface Data {
  bossFreezeStatus: number
  companyName: string
  tinyUrl: string
  title: string
  mobileVisible: number
  encryptJobId: string
  regionCode: string
  bothTalked: boolean
  encryptBossId: string
  warningTips: any[]
  bossId: number
  weixinVisible: number
  mobile: string
  securityId: string
  bossPreFreezeStatus: number
  weixin: string
  curTime: number
  isTop: number
  name: string
  hasInterview: boolean
  bossSource: number
}

interface Job {
  jobName: string
  salaryDesc: string
  brandName: string
  locationName: string
  proxyJob: number
  proxyType: number
  jobSource: number
  degreeName: string
  lowSalary: number
  highSalary: number
  experienceName: string
}
