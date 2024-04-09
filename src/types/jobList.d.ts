/**
{
    "securityId": "MkH058uXDc4sU-i1l4VbvZmj9_gr__B7pCQsWHxgDfyqM4kNSO",
    "bossAvatar": "https://img.bosszhipin.com/boss/avata.png",
    "bossCert": 3,
    "encryptBossId": "4e3d3f84abdb00000000000000E1M~",
    "bossName": "周靖丰",
    "bossTitle": "招聘者",
    "goldHunter": 0,
    "bossOnline": false,
    "encryptJobId": "ee226d371da000000000000000EVRW",
    "expectId": 89300700003,
    "jobName": "PHP",
    "lid": "6VzQgg00000000arch.1",
    "salaryDesc": "8-13K",
    "jobLabels": [
        "1-3年",
        "学历不限"
    ],
    "jobValidStatus": 1,
    "iconWord": "",
    "skills": [
        "PHP",
        "PHP开发经验",
        "服务端开发经验",
        "大数据项目开发经验"
    ],
    "jobExperience": "1-3年",
    "daysPerWeekDesc": "",
    "leastMonthDesc": "",
    "jobDegree": "学历不限",
    "cityName": "成都",
    "areaDistrict": "双流区",
    "businessDistrict": "华阳",
    "jobType": 0,
    "proxyJob": 0,
    "proxyType": 0,
    "anonymous": 0,
    "outland": 0,
    "optimal": 0,
    "iconFlagList": [],
    "itemId": 1,
    "city": 101270100,
    "isShield": 0,
    "atsDirectPost": false,
    "gps": null,
    "lastModifyTime": 1710067550000,
    "encryptBrandId": "6d13c74057000000000EFQ~",
    "brandName": "御坂网络",
    "brandLogo": "https://img.bosszhipin.00000098.png.webp",
    "brandStageName": "",
    "brandIndustry": "互联网",
    "brandScaleName": "20-99人",
    "welfareList": [
        "意外险",
        "工龄奖",
        "团建聚餐",
    ],
    "industry": 100020,
    "contact": false
}
*/
interface JobListData {
  securityId: string;
  bossAvatar: string;
  bossCert: number;
  encryptBossId: string;
  bossName: string;
  bossTitle: string;
  goldHunter: number;
  bossOnline: boolean;
  encryptJobId: string;
  expectId: number;
  jobName: string;
  lid: string;
  salaryDesc: string;
  jobLabels: string[];
  jobValidStatus: number;
  iconWord: string;
  skills: string[];
  jobExperience: string;
  daysPerWeekDesc: string;
  leastMonthDesc: string;
  jobDegree: string;
  cityName: string;
  areaDistrict: string;
  businessDistrict: string;
  jobType: number;
  proxyJob: number;
  proxyType: number;
  anonymous: number;
  outland: number;
  optimal: number;
  iconFlagList: any[];
  itemId: number;
  city: number;
  isShield: number;
  atsDirectPost: boolean;
  gps: any;
  lastModifyTime: number;
  encryptBrandId: string;
  brandName: string;
  brandLogo: string;
  brandStageName: string;
  brandIndustry: string;
  brandScaleName: string;
  welfareList: string[];
  industry: number;
  contact: boolean;
}

type JobList = JobListData[];
