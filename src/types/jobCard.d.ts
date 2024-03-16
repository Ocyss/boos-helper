/**
 * 职位信息卡片接口
 */
interface JobCard {
  /** 职位名称，例如："电脑技术员" */
  jobName: string;
  /** 岗位描述，例如："测试电脑配件" */
  postDescription: string;
  /** 加密职位ID，例如："162c879061111t2_GFVZ" */
  encryptJobId: string;
  /** 是否直接发布到 ATS，例如：false */
  atsDirectPost: boolean;
  /** 是否代理发布，例如：false */
  atsProxyJob: boolean;
  /** 薪资描述，例如："4-5K" */
  salaryDesc: string;
  /** 城市名称，例如："成都" */
  cityName: string;
  /** 工作经验要求，例如："1年以内" */
  experienceName: string;
  /** 学历要求，例如："高中" */
  degreeName: string;
  /** 职位标签，例如：["企业内部IT技术支持", "售前/售后技术支持"] */
  jobLabels: string[];
  /** 工作地址，例如："成都武侯区广和 */
  address: string;
  /** 唯一标识ID，例如："3j51231ut.search.3" */
  lid: string;
  /** 会话ID，例如："" */
  sessionId: string;
  /** 安全ID，例如："QFGEz123CzXQ-111111A9qKWHZZtes8aKQt9StSI655FRNtYx123123123" */
  securityId: string;
  /** 加密用户ID，例如："a111111b05711111111dy1FFJZ" */
  encryptUserId: string;
  /** 上级领导姓名，例如："小明" */
  bossName: string;
  /** 上级领导职称，例如："经理" */
  bossTitle: string;
  /** 上级领导头像，例如："https://img.bosszhipin.com/boss/avatar/avatar_2.png" */
  bossAvatar: string;
  /** 是否在线，例如：false */
  online: boolean;
  /** 是否认证，例如：true */
  certificated: boolean;
  /** 活跃时间描述，例如："本月活跃" */
  activeTimeDesc: string;
  /** 品牌名称，例如："宇鑫电脑..." */
  brandName: string;
  /** 是否可以添加为好友，例如：true */
  canAddFriend: boolean;
  /** 好友状态，例如：1 */
  friendStatus: number;
  /** 是否感兴趣，例如：0 */
  isInterested: number;
  /** 是否登录，例如：true */
  login: boolean;
}
