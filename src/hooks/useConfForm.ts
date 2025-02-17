import type { FormData, FormInfoData } from '@/types/formData'
import deepmerge from '@/utils/deepmerge'

import { logger } from '@/utils/logger'

import { getStorage, setStorage } from '@/utils/message/storage'
import { watchThrottled } from '@vueuse/core'

import { reactive, ref, toRaw } from 'vue'

export const formDataKey = 'sync:web-geek-job-FormData'
export const todayKey = 'local:web-geek-job-Today'
export const statisticsKey = 'local:web-geek-job-Statistics'

export const formInfoData: FormInfoData = {
  company: {
    'label': '公司名',
    'data-help': '公司名排除或包含在集合中，模糊匹配，可用于只投或不投某个公司/子公司。',
  },
  jobTitle: {
    'label': '岗位名',
    'data-help': '岗位名排除或包含在集合中，模糊匹配，可用于只投或不投某个岗位名。',
  },
  jobContent: {
    'label': '工作内容',
    'data-help': '会自动检测上文(不是,不,无需),下文(系统,工具),例子：[外包,上门,销售,驾照], 排除: \'外包岗位\', 不排除: \'不是外包\'|\'销售系统\'',
  },
  hrPosition: {
    'label': 'Hr职位',
    'data-help': 'Hr职位一定包含/排除在集合中，精确匹配, 不在内置中可手动输入,能实现只向经理等进行投递，毕竟人事干的不一定是人事',
  },
  salaryRange: {
    'label': '薪资范围',
    'data-help': '投递工作的薪资范围, 交集匹配, 使用-连接范围, 单位: k。例如：【12-20】',
  },
  companySizeRange: {
    'label': '公司规模范围',
    'data-help': '投递工作的公司规模, 子集匹配, 使用-连接范围。例如：【500-20000000】',
  },
  customGreeting: {
    'label': '自定义招呼语',
    'data-help': '因为boss不支持将自定义的招呼语设置为默认招呼语。开启表示发送boss默认的招呼语后还会发送自定义招呼语',
  },
  greetingVariable: {
    'label': '招呼语变量',
    'data-help': '使用mitem模板引擎来对招呼语进行渲染;',
  },
  activityFilter: {
    'label': '活跃度过滤',
    'data-help': '打开后会自动过滤掉最近未活跃的Boss发布的工作。以免浪费每天的100次机会。',
  },
  goldHunterFilter: {
    'label': '猎头过滤',
    'data-help': 'Boss中有一些猎头发布的工作，但是一般而言这种工作不太行，点击可以过滤猎头发布的职位',
  },
  friendStatus: {
    'label': '好友过滤(已聊)',
    'data-help': '判断和hr是否建立过聊天，理论上能过滤的同hr，但是不同岗位的工作',
  },
  notification: {
    'label': '发送通知',
    'data-help': '可以在网站管理中打开通知权限,当停止时会自动发送桌面端通知提醒。',
  },
  deliveryLimit: {
    'label': '投递上限',
    'data-help': '达到上限后会自动暂停，默认100次',
  },
  aiGreeting: {
    'label': 'AI招呼语',
    'data-help': '即使前面招呼语开了也不会发送，只会发送AI生成的招呼语，让gpt来打招呼真是太棒了，毕竟开场白很重要。',
    'example': [
      `我现在需要求职，所以请你来写求职招呼语来向boos或hr打招呼，你需要代入我的身份也就是一名求职者.
## 能力:
\"我叫Ocyss,是一名19岁的全栈工程师，拥有丰富的前后端客户端开发经验，并且我也能够进行服务器运维。我是一个完美主义者，追求效率至上，我会把所有麻烦重复的事情都编写成脚本。我擅长使用Golang, Kitex, Hertz, Gin, Gorm, Cobra等后端技术，Rust和Iced, Slint等客户端技术，以及Vue3, Vite, scss, Nuxt, naiveui, element-plus等前端技术。我还熟悉Mysql, Redis, PostgreSQL, Python, Docker, Linux等运维和其他技术。我曾经参与过多个项目的开发，如全栈博客系统，飞书多维表格插件，字节青训营项目等。我相信我的技能和经验可以为您的公司带来价值。\"
## 要求:
1. 我会告诉你岗位信息,你只需要回答招呼语，请优先礼貌为主不要过于使用书信格式而是聊天一样的招呼语，最好能根据岗位信息来改变语气。
2. 一定不可以编造能力,我会啥上面写的很清楚了,如果有我没说的技术栈那就是不会,可以展示其他优势.不要乱写
3. 我需要你在结束的时候告诉他这是ai生成的内容仅供参考
## 岗位信息:
\`\`\`
岗位名:{{ card.jobName }}
岗位描述:{{ card.postDescription }}
经验要求:{{ card.experienceName }}
相关标签:{{ card.jobLabels }}
\`\`\`
`,
      [
        {
          role: 'user',
          content: `# Role: 求职小能手
# Author: Ocyss_04
## Definition
求职小能手是一种专业角色，能帮根据求职者的简历结合岗位的信息生成高质量的招呼语。这个角色很聪明能根据岗位信息避重就轻，将求职者的技能合理的划分，能生成对这个岗位的帮助和求职者的优势，不会将其他技能也带入招呼语中，皆在快速有效的让Hr了解到求职者的能力与优势，从而帮助这些找不到工作的社畜能拿到一份合适的offer

## Goals
1. **简洁明了** - 不啰嗦不废话只讲和岗位信息有关的内容
2. **抓住重点** - 当求职者有多个方向的技术栈时，能根据岗位需求突出这方面的优势和能力
3. **突出优势** - 岗位的技术栈求职者不会，会用其他技能来突出求职者的能力

## Constrains
1. **严谨心细** - 不将求职者不会的技能写进招呼语中，不能篡改求职者的技能熟练度与年限
2. **和蔼可亲** - 不需要书信等格式像聊天开场白一样打招呼
3. **避免风险** - 最后说明这是ai生成的内容仅供参考

## skill
1. **全栈高手** - 精通编程的各种技术栈，知道不同的框架，有效的突出求职者的技能
2. **职场老炮** - 多年职场经验仅从岗位信息就能明白老板意思，从而生成幽默风趣符合老板胃口的招呼语

## Workflow
1. 步骤一：先根据\`input\`的求职者信息进一步思考理解并消化，然后执行\`Initialization\` 告知用户已准备完毕。
2. 步骤二：开始用户输入的\`岗位信息\`进行思考理解，分析出岗位需要的技术栈和业务的需求
3. 步骤三：结合求职者的能力和经历生成合适的招呼语，并确保内容中无虚构求职者的能力和年限等信息，然后按\`outputformat\`输出

## input：
1 **求职者信息**
\`\`\`
我是一名19岁的全栈工程师，拥有丰富的前后端客户端开发经验，并且我也能够进行服务器运维。我是一个完美主义者，追求效率至上，我会把所有麻烦重复的事情都编写成脚本。我擅长使用Golang, Kitex, Hertz, Gin, Gorm, Cobra等后端技术，Rust和Iced, Slint等客户端技术，以及Vue3, Vite, scss, Nuxt, naiveui, element-plus等前端技术。我还熟悉Mysql, Redis, PostgreSQL, Python, Docker, Linux等运维和其他技术。我曾经参与过多个项目的开发，如全栈博客系统，飞书多维表格插件，字节青训营项目等。我相信我的技能和经验可以为您的公司带来价值。
#### 项目详细
1. ....
2. ....
3. ....
\`\`\`

## outputformat
招呼语字符串，无书信格式和前缀，和聊天开场白一样的介绍求职者

## Initialization:
"你好，我是求职小能手，我已经掌握了您的能力。我将利用我的专业技能和严谨认真的态度为您生成独一无二且的求职招呼语。现在请提供岗位信息，我将开始为您生成求职招呼语"
`,
        },
        {
          role: 'assistant',
          content:
            '你好，我是求职小能手，我已经掌握了您的能力。我将利用我的专业技能和严谨认真的态度为您生成独一无二且的求职招呼语。现在请提供岗位信息，我将开始为您生成求职招呼语',
        },
        {
          role: 'user',
          content: `### 待处理的岗位信息:\`\`\`
岗位名:{{ card.jobName }}
岗位描述:{{ card.postDescription }}
经验要求:{{ card.experienceName }}
相关标签:{{ card.jobLabels }}
\`\`\``,
        },
      ],
    ],
  },
  aiFiltering: {
    'label': 'AI过滤',
    'data-help': '根据工作内容让gpt分析过滤，真是太稳健了，不放过任何一个垃圾',
    'example': [
      `我现在需要求职，让你根据我的需要对岗位进行评分，方便我筛选岗位。
## 要求:
- 加分: 双休,早九晚五,新技术,机会多,年轻人多
- 扣分: 需要上门,福利少,需要和客户交流,需要推销
## 是岗位相关信息:
\`\`\`
岗位描述:{{ card.postDescription}}
薪酬:{{card.salaryDesc}}
经验要求:{{card.experienceName}},学历要求:{{card.degreeName}}
相关标签:{{card.jobLabels}},公司福利：{{data.welfareList}}
\`\`\`
## 输出
interface aiFiltering {
  rating: number; // 分数，0-100分，低于40的我会筛选掉
  negative: string[] | string; // 扣分项
  positive: string[] | string; // 加分项
}`,
      [
        {
          role: 'user',
          content: `# Role: 求职评委
# Author: Ocyss_04
## Profile
- Language: 中文
- Description: 拥有丰富的职场经验能从岗位信息中看出这个岗位的价值和风险,也明白求职者真正需要的岗位是啥,从多方面考虑进而评分

### 擅长人情世故:
1. 知道这个老板是压榨员工的资本家还是更看重员工能力的企业家
2.公司福利能看出老板真正的心思
3.知道求职者的需求,是想要的福利还是必要的福利从而加分或减分

## Rules
1. 客观评价有理有据
2. 不能把用户想要的福利当成扣分项

## Workflow
1. 岗位初始有70分,输入岗位信息结合下面的求职者需求来进行打分,最终返回下面格式的JSON字符串,不要有任何其他字符
interface aiFiltering {
  rating: number; // 分数, 低于40的我会筛选掉
  negative: string[] | string; // 扣分项
  positive: string[] | string; // 加分项
}

## 求职者需求
- 加分: 双休,早九晚五,新技术,机会多,年轻人多
- 扣分: 需要上门,福利少,需要和客户交流,需要推销

## Initialization
你好,我是求职评为,我已经掌握了您的能力。我将利用我的专业技能和严谨认真的态度对你输入的岗位信息进行打分,并返回符合格式的Json格式字符串
`,
        },
        {
          role: 'assistant',
          content:
            '你好,我是求职评为,我已经掌握了您的能力。我将利用我的专业技能和严谨认真的态度对你输入的岗位信息进行打分,并返回符合格式的Json格式字符串',
        },
        {
          role: 'user',
          content: `### 待处理的岗位信息:\`\`\`
岗位描述:{{ card.postDescription}}
相关标签:{{card.jobLabels}}
公司福利：{{data.welfareList}}
\`\`\``,
        },
      ],
    ],
  },
  aiReply: {
    'label': 'AI回复',
    'data-help': '万一消息太多，回不过来了呢，也许能和AiHR聊到地球爆炸？魔法击败魔法',
  },
  record: {
    'label': '内容记录',
    'data-help': '拿这些数据去训练个Ai岂不是美滋滋咯？',
  },
  delay: {
    deliveryStarts: {
      'label': '投递开始',
      'data-help': '点击投递按钮会等待一段时间,默认值10s',
    },
    deliveryInterval: {
      'label': '投递间隔',
      'data-help': '每个投递的间隔,太快易风控,默认值2s',
    },
    deliveryPageNext: {
      'label': '投递翻页',
      'data-help': '投递完下一页之后等待的间隔,太快易风控,默认值60s',
    },
    messageSending: {
      'label': '消息发送',
      'data-help': '暂未实现 ,在发送消息前允许等待一定的时间让用户来修改或手动发送,默认值5s',
      'disable': true,
    },
  },
}

export const defaultFormData: FormData = {
  company: {
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  jobTitle: {
    include: true,
    value: [],
    options: [],
    enable: false,
  },
  jobContent: {
    include: false,
    value: [],
    options: [],
    enable: false,
  },
  hrPosition: {
    include: true,
    value: [],
    options: ['经理', '主管', '法人', '人力资源主管', 'hr', '招聘专员'],
    enable: false,
  },
  salaryRange: {
    value: '8-13',
    enable: false,
  },
  companySizeRange: {
    value: '',
    enable: false,
  },
  customGreeting: {
    value: '',
    enable: false,
  },
  deliveryLimit: {
    value: 100,
  },
  greetingVariable: {
    value: true,
  },
  activityFilter: {
    value: true,
  },
  friendStatus: {
    value: true,
  },
  goldHunterFilter: {
    value: false,
  },
  notification: {
    value: true,
  },
  aiGreeting: {
    enable: false,
    prompt: '',
  },
  aiFiltering: {
    enable: false,
    prompt: '',
  },
  aiReply: {
    enable: false,
    prompt: '',
  },
  record: {
    enable: false,
  },
  delay: {
    deliveryStarts: 3,
    deliveryInterval: 2,
    deliveryPageNext: 60,
    messageSending: 5,
  },
}

const formData: FormData = reactive(defaultFormData)
const isLoaded = ref(false)

async function init() {
  const data = deepmerge<FormData>(defaultFormData, await getStorage(formDataKey, {}))
  Object.assign(formData, data)
  isLoaded.value = true
}

void init()

watchThrottled(
  formData,
  (v) => {
    logger.debug('formData改变', toRaw(v))
  },
  { throttle: 2000 },
)

async function confSaving() {
  const v = jsonClone(formData)
  await setStorage(formDataKey, v)
  logger.debug('formData保存', v)
}

async function confReload() {
  const v = deepmerge<FormData>(defaultFormData, await getStorage(formDataKey, {}))
  deepmerge(formData, v, { clone: false })
  logger.debug('formData已重置')
}

async function confExport() {
  const data = deepmerge<FormData>(
    defaultFormData,
    await getStorage(formDataKey, {}),
  )

  const blob = new Blob([JSON.stringify(data)], {
    type: 'application/json',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '打招呼配置.json'
  link.click()
}

function confImport() {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'

  fileInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file || !file.name.endsWith('.json')) {
      return alert('不是 JSON 文件')
    }

    const reader = new FileReader()
    reader.onload = async function (e) {
      try {
        const jsonData = JSON.parse(e.target!.result as string)

        const type = Object.prototype.toString.call(jsonData).slice(8, -1)
        if (!['Array', 'Object'].includes(type)) {
          return alert('内容非合法 JSON')
        }

        await setStorage(formDataKey, jsonData)
        deepmerge(formData, jsonData, { clone: false })
      }
      catch (error: any) {
        return alert(`内容非合法 JSON, ${error.message}`)
      }
    }
    reader.readAsText(file)
  })

  fileInput.click()
}

function confDelete() {
  deepmerge(formData, defaultFormData, { clone: false })
  logger.debug('formData已清空')
}

export function useConfFormData() {
  return {
    confSaving,
    confReload,
    confExport,
    confImport,
    confDelete,
    formDataKey,
    defaultFormData,
    formData,
    isLoaded,
  }
}
