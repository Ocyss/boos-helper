import type { CookieInfo } from '@/utils/message/cookie'
import { logger } from '@/utils/logger'
import { clearCookie, deleteCookie, getCookieInfo, saveCookie, switchCookie } from '@/utils/message/cookie'
import { setStorage } from '@/utils/message/storage'
import { ElMessage } from 'element-plus'
import { miTem } from 'mitem'
import { ref } from 'vue'
import { getRootVue } from './useVue'

export const userInfo = ref<{
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
}>()

export function getUserId(): number | string | null {
  return userInfo.value?.userId
  ?? window?._PAGE?.uid
  ?? window?._PAGE?.userId
}

export async function userInfoInit() {
  const v = await getRootVue()
  const store = v?.$store?.state
  userInfo.value = store?.userInfo
  logger.debug('userInfo: ', userInfo.value)
}

export function useCookieInfo() {
  const data = ref<Record<string, CookieInfo>>({})

  const tableData = computed(() => Object.values(data.value))

  getCookieInfo().then((res) => {
    res = res ?? {}
    logger.debug('账户数据', res)
    data.value = res
  }).catch((err) => {
    logger.error('获取账户数据失败', err)
    ElMessage.error(`获取账户数据失败: ${err}`)
  })
  return {
    data,
    tableData,
  }
}

export async function createUser({ change = false, uid = getUserId(), clearCk = true }) {
  logger.debug('开始创建账户')
  const { formData } = useConfFormData()

  // 如果不切换账号或者
  // 切换账号但是有uid则创建
  if (!change || uid != null) {
    if (uid == null) {
      throw new Error('找不到uid')
    }
    uid = String(uid)

    const val: CookieInfo = {
      uid,
      user: userInfo.value?.showName ?? userInfo.value?.name ?? '未知用户',
      avatar: userInfo.value?.tinyAvatar ?? userInfo.value?.largeAvatar ?? '',
      remark: '',
      gender: userInfo.value?.gender === 0 ? 'man' : 'woman',
      flag: userInfo.value?.studentFlag ? 'student' : 'staff',
      date: new Date().toLocaleString(),
      form: jsonClone(formData),
      statistics: await getStatistics(),
    }
    await saveCookie(val)
    return val
  }
  if (clearCk) {
    await clearCookie()
  }
}

export async function changeUser(currentRow?: CookieInfo) {
  if (!currentRow) {
    ElMessage.error('请先选择要切换的账号')
    return
  }

  const targetAccount = jsonClone(currentRow)

  // 保存当前账号状态
  await createUser({ change: true })

  // 恢复目标账号的配置
  if (targetAccount.form) {
    await setStorage(formDataKey, targetAccount.form)
  }

  if (targetAccount.statistics != null) {
    await setStatistics(targetAccount.statistics)
  }

  // 切换到目标账号
  await switchCookie(targetAccount.uid)
}

export async function deleteUser(d: CookieInfo) {
  try {
    await deleteCookie(d.uid)
    ElMessage.success('账号删除成功')
  }
  catch (error) {
    logger.error('删除账号失败', error)
    ElMessage.error('删除账号失败，请重试')
  }
}

export const UserResumeStringOptions = {
  基本信息: false
    ? false as const
    : {
        姓名: false,
        年龄: true,
        性别: true,
        学历: true,
        求职状态: true,
        工作年限: true,
      },
  期望职位: true,
  个人优势: true,
  工作经历: true,
  项目经历: true,
  教育经历: true,
  资格证书: true,
}

export async function getUserResumeString(options: Partial<typeof UserResumeStringOptions>) {
  options = {
    ...UserResumeStringOptions,
    ...options,
  }

  const data = await getUserResumeData()

  let template = ''
  if (typeof options.基本信息 === 'object') {
    template += `## 基本信息
${options.基本信息.姓名 ? `- 姓名: {{zpData.baseInfo.nickName}}` : ''}
${options.基本信息.年龄 ? `- 年龄: {{zpData.baseInfo.age}}` : ''}
${options.基本信息.性别 ? `- 性别: {{zpData.baseInfo.gender | genUserResumeGender}}` : ''}
${options.基本信息.学历 ? `- 学历: {{zpData.baseInfo.degreeCategory}}` : ''}
${options.基本信息.工作年限 ? `- 工作年限: {{zpData.baseInfo.workYearDesc}}` : ''}
${options.基本信息.求职状态 ? `- 求职状态: {{zpData.applyStatus | genUserResumeStatus}}` : ''}
`.replaceAll(/^\s*$/gm, '')
  }

  if (options.期望职位) {
    template += `

## 期望职位
{% for item in zpData.expectList %}- {{item.positionName}} {{item.salaryDesc}}
{% endfor %}`
  }
  if (options.个人优势) {
    template += `

## 个人优势

<个人优势>
{{zpData.userDesc}}
</个人优势>`
  }
  if (options.工作经历) {
    template += `

## 工作经历
{% for item in zpData.workExpList %}
### {{item.companyName}} ({{item.positionName}}) {{item.startDate}}-{{item.endDate}}
相关技能: {% for emphasi in item.emphasis %} \`{{emphasi}}\` {% endfor %}
<工作内容>
{{item.workContent}}
</工作内容>
<工作业绩>
{{item.workPerformance}}
</工作业绩>

{% endfor %}
`
  }
  if (options.项目经历) {
    template += `

## 项目经历
{% for item in zpData.projectExpList %}
### {{item.name}} ({{item.roleName}}) {{item.startDate}}-{{item.endDate}}
<项目描述>
{{item.projectDesc}}
</项目描述>
<项目业绩>
{{item.performance}}
</项目业绩>

{% endfor %}
`
  }
  if (options.教育经历) {
    template += `

## 教育经历
{% for item in zpData.educationExpList %}- {{item.school}} {{item.startYear}}-{{item.endYear}}
    {{item.degreeName}}
{% endfor %}`
  }
  if (options.资格证书) {
    template += `
## 资格证书:
{% for item in zpData.certificationList %}- {{item.certName}}
{% endfor %}`
  }

  miTem.filters.genUserResumeGender = function () {
    return this === 1 ? '男' : '女'
  }
  miTem.filters.genUserResumeStatus = function () {
    switch (this) {
      case 0:
        return '离职-随时到岗'
      case 1:
        return '在职-暂不考虑'
      case 2:
        return '在职-考虑机会'
      case 3:
        return '在职-月内到岗'
      default:
        return '未知'
    }
  }

  logger.debug('getUserResumeString模板', { template, data })

  return miTem.compile(template)({ data, zpData: data })
}

window.__q_getUserResumeString = getUserResumeString

let resumeData: boosZpResumeData | null = null

export async function getUserResumeData() {
  if (resumeData != null) {
    return resumeData
  }
  const token = window?.Cookie.get('bst')
  const res = await fetch(`https://www.zhipin.com/wapi/zpgeek/resume/geek/preview/data.json?_=${Date.now()}`, {
    headers: {
      Zp_token: token,
    },
  })
  const data = await res.json() as {
    code: number
    message: string
    zpData: boosZpResumeData
  }
  if (data.code !== 0) {
    ElMessage.error(`获取简历数据失败: ${data.message}`)
    throw new Error(data.message)
  }
  resumeData = data.zpData
  return data.zpData
}
