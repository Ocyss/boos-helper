interface bossZpBossData {
  data: {
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
  job: {
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
}

/**
 * 职位信息,在模板中通常使用 data 获取
 * 如 {{ data.jobName }} 获取工作名称
 */
interface bossZpJobItemData {
  /** 安全标识符，例如：'MkH058uX...' */
  securityId: string
  /** 招聘者头像的URL，例如：'https://img.bosszhipin.com/boss/avatar.png' */
  bossAvatar: string
  /** 招聘者认证等级，例如：3 */
  bossCert: number
  /** 加密后的招聘者ID，例如：'4e3d3f84...' */
  encryptBossId: string
  /** 招聘者姓名，例如：'周靖丰' */
  bossName: string
  /** 招聘者职称，例如：'招聘者' */
  bossTitle: string
  /** 是否是金牌猎头（0为否，1为是），例如：0 */
  goldHunter: number
  /** 招聘者是否在线，例如：false */
  bossOnline: boolean
  /** 加密后的工作ID，例如：'ee226d37...' */
  encryptJobId: string
  /** 预期ID，可能用于追踪求职者的应聘活动，例如：89300700003 */
  expectId: number
  /** 工作名称，例如：'PHP' */
  jobName: string
  /** 日志ID，可能用于追踪或日志系统，例如：'6VzQgg0000...' */
  lid: string
  /** 薪资描述，例如：'8-13K' */
  salaryDesc: string
  /** 工作标签，如经验和学历要求，例如：['1-3年', '学历不限'] */
  jobLabels: string[]
  /** 工作有效状态，例如：1 */
  jobValidStatus: number
  /** 图标文字，例如：'' */
  iconWord: string
  /** 技能要求列表，例如：['PHP', 'PHP开发经验', '服务端开发经验', '大数据项目开发经验'] */
  skills: string[]
  /** 工作经验要求，例如：'1-3年' */
  jobExperience: string
  /** 每周工作天数描述，例如：'' */
  daysPerWeekDesc: string
  /** 最短工作月数描述，例如：'' */
  leastMonthDesc: string
  /** 学历要求，例如：'学历不限' */
  jobDegree: string
  /** 城市名称，例如：'成都' */
  cityName: string
  /** 地区/县，例如：'双流区' */
  areaDistrict: string
  /** 商业区域，例如：'华阳' */
  businessDistrict: string
  /** 工作类型标识，例如：0 */
  jobType: number
  /** 是否代理工作，例如：0 */
  proxyJob: number
  /** 代理类型，例如：0 */
  proxyType: number
  /** 是否匿名发布，例如：0 */
  anonymous: number
  /** 是否为境外工作，例如：0 */
  outland: number
  /** 是否为优选职位，例如：0 */
  optimal: number
  /** 图标标记列表，例如：[] */
  iconFlagList: any[]
  /** 物品ID，例如：1 */
  itemId: number
  /** 城市编码，例如：101270100 */
  city: number
  /** 是否被屏蔽，例如：0 */
  isShield: number
  /** 是否直接通过ATS发布，例如：false */
  atsDirectPost: boolean
  /** GPS位置，例如：null */
  gps: any
  /** 最后修改时间（时间戳），例如：1710067550000 */
  lastModifyTime: number
  /** 加密后的品牌ID，例如：'6d13c740...' */
  encryptBrandId: string
  /** 品牌名称，例如：'御坂网络' */
  brandName: string
  /** 品牌Logo的URL，例如：'https://img.bosszhipin.00000098.png.webp' */
  brandLogo: string
  /** 品牌阶段名称，例如：'' */
  brandStageName: string
  /** 品牌所属行业，例如：'互联网' */
  brandIndustry: string
  /** 品牌规模描述，例如：'20-99人' */
  brandScaleName: string
  /** 福利列表，例如：['意外险', '工龄奖', '团建聚餐'] */
  welfareList: string[]
  /** 行业编码，例如：100020 */
  industry: number
  /** 是否已沟通 */
  contact: boolean
}

/**
 * 职位卡片信息,在模板中通常使用 card 获取
 * 如 {{ card.activeTimeDesc }} 获取活跃时间描述
 */
interface bossZpCardData {
  /** 职位名称，例如："电脑技术员" */
  jobName: string
  /** 岗位描述，例如："测试电脑配件" */
  postDescription: string
  /** 加密职位ID，例如："162c879061111t2_GFVZ" */
  encryptJobId: string
  /** 是否直接发布到 ATS，例如：false */
  atsDirectPost: boolean
  /** 是否代理发布，例如：false */
  atsProxyJob: boolean
  /** 薪资描述，例如："4-5K" */
  salaryDesc: string
  /** 城市名称，例如："成都" */
  cityName: string
  /** 工作经验要求，例如："1年以内" */
  experienceName: string
  /** 学历要求，例如："高中" */
  degreeName: string
  /** 职位标签，例如：["企业内部IT技术支持", "售前/售后技术支持"] */
  jobLabels: string[]
  /** 工作地址，例如："成都武侯区广和 */
  address: string
  /** 唯一标识ID，例如："3j51231ut.search.3" */
  lid: string
  /** 会话ID，例如："" */
  sessionId: string
  /** 安全ID，例如："QFGEz123CzXQ-111111A9qKWHZZtes8aKQt9StSI655FRNtYx123123123" */
  securityId: string
  /** 加密用户ID，例如："a111111b05711111111dy1FFJZ" */
  encryptUserId: string
  /** 上级领导姓名，例如："小明" */
  bossName: string
  /** 上级领导职称，例如："经理" */
  bossTitle: string
  /** 上级领导头像，例如："https://img.bosszhipin.com/boss/avatar/avatar_2.png" */
  bossAvatar: string
  /** 是否在线，例如：false */
  online: boolean
  /** 是否认证，例如：true */
  certificated: boolean
  /** 活跃时间描述，例如："本月活跃" */
  activeTimeDesc: string
  /** 品牌名称，例如："宇鑫电脑..." */
  brandName: string
  /** 是否可以添加为好友，例如：true */
  canAddFriend: boolean
  /** 好友状态，例如：1 */
  friendStatus: number
  /** 是否感兴趣，例如：0 */
  isInterested: number
  /** 是否登录，例如：true */
  login: boolean
}

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

/**
 * 简历数据
 */
type bossZpResumeData = DeepPartial<{
  baseInfo: {
    name: string
    nickName: string
    tiny: string
    birthday: string
    age: string
    gender: number
    degree: number
    degreeCategory: string
    account: string
    emailBlur: string
    weixinBlur: string
    freshGraduate: number
    workYears: number
    nameShowType: number
    bossCert: number
    userCert: number
    certGender: boolean
    certBirth: boolean
    startWorkDate: number
    applyStatus: number
    workYearDesc: string
    resumeStatus: number
    resumeCount: number
    complete: boolean
    weiXinSecurityUid: any
    garbageFieldList: any
    hometown: number
    hometownName: any
    studyAbroadCertPass: number
    highestEduExp: any
    showF3Optimize: number
    startWorkDateDesc: string
    birthdayDesc: string
  }
  userDesc: string
  applyStatus: number
  lastUpdateTime: string
  workEduDesc: string
  expectList: Array<{
    id: string
    position: number
    positionName: string
    customPositionId: string
    positionType: number
    location: number
    locationName: string
    subLocation: number
    subLocationName: any
    lowSalary: number
    highSalary: number
    salaryDesc: string
    industryList: Array<{
      code: number
      name: string
    }>
    industryDesc: string
    suggestPosition: string
    applyStatus: number
    freshGraduate: number
    doneWorkPositionList: any
    garbageFieldList: any
    interestPositionList: any
    interestLocationList: any
    industryExpect: boolean
    tagName: any
  }>
  workExpList: Array<{
    id: string
    companyName: string
    industry: {
      code: number
      name: string
    }
    department: string
    customPositionName: string
    position: number
    positionName: string
    positionLv2: number
    startDate: string
    startDateStr: string
    endDate: string
    endDateStr: string
    emphasis: Array<string>
    workContent: string
    workPerformance: string
    isPublic: number
    workType: number
    suggestToDel: number
    garbageFieldList: any
  }>
  projectExpList: Array<{
    id: string
    name: string
    roleName: string
    url: string
    startDate: string
    endDate: string
    projectDesc: string
    performance: string
    suggestToDel: number
    garbageFieldList: any
    endDateStr: string
    startDateStr: string
  }>
  educationExpList: Array<{
    id: string
    schoolId: number
    school: string
    major: string
    degree: number
    eduType: number
    degreeName: string
    startYear: string
    endYear: string
    educationDesc: string
    country: any
    tags: any
    schoolType: number
    suggestToDel: number
    thesisTitle: string
    thesisDesc: string
    majorRanking: number
    courseList: Array<any>
    badge: string
    garbageFieldList: any
    startYearStr: string
    endYearStr: string
  }>
  socialContactList: any
  volunteerExpList: Array<{
    id: string
    name: string
    serviceLength: string
    startDate: string
    endDate: string
    volunteerDesc: string
    garbageFieldList: any
    endDateStr: string
    volunteerDescription: string
    startDateStr: string
  }>
  certificationList: Array<{
    certId: string
    certName: string
    certStatus: number
    certType: number
  }>
  trainingExpList: any
  designWorksImage: any
  designWorksVideo: any
  personalImage: any
  deliciousFoodImage: any
  garbage: {
    status: number
    reasonCode: number
    resumeDetailStatus: number
    garbageBaseInfo: any
    baseInfo: any
    garbageUserDesc: any
    personalAdvantages: any
    garbageWorkExp: any
    workExp: any
    garbageEduExp: any
    eduExp: any
    garbageProjectExp: any
    projectExp: any
    garbageVolunteerExp: any
    volunteerExp: any
    garbageExpectList: any
    expect: any
    garbageCertificationList: any
    certification: any
    designWorks: any
    designWorksImageList: any
    designWorksVideoList: any
    garbageHandicapped: any
    handicapped: any
    trainingExp: any
    clubExp: any
    professionalSkill: any
    honor: any
  }
  editStatus: {
    canAddExpect: boolean
    canAddWorkExp: boolean
    canAddProjectExp: boolean
    canAddEduExp: boolean
    canAddSocialContact: boolean
  }
  doneWorkPositionList: Array<any>
  handicappedInfo: any
  postExpList: Array<any>
  myLabels: any
  clubExpList: Array<any>
  professionalSkill: string
  honorList: Array<any>
  feature: {
    showNewPositionStyle: number
    showHandicappedModule: number
    showResumeImportBtn: number
    showResumeImportBtnRedDot: boolean
    showResumeFillHelper: number
    showTrainingExpModule: number
    showF3Optimize: number
    showPostExpModule: number
    webResumeLabelModule: number
    expectLocationInterestCombine: number
    stuMultiExpectChoose: number
  }
  virtualPartTimeCombineExpect: any
}>
