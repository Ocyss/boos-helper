import type {
  CompanyNameError,
  CompanySizeError,
  JobDescriptionError,
  JobTitleError,
  PublishError,
  SalaryError,
  UnknownError,
} from '@/types/deliverError'
import type { Column } from 'element-plus'

import type { MyJobListData } from './useJobList'
import { ElTag } from 'element-plus'
import { ref } from 'vue'

export type logErr =
  | null
  | undefined
  | PublishError
  | JobTitleError
  | CompanyNameError
  | SalaryError
  | CompanySizeError
  | JobDescriptionError
  | UnknownError

export interface logData {
  listData: MyJobListData
  el?: Element
  boosData?: BoosData
  message?: string
  state?: string
  err?: string
  aiFilteringQ?: string
  aiFilteringR?: string
  aiFilteringAjson?: object
  aiFilteringAtext?: string
  aiGreetingQ?: string
  aiGreetingR?: string
  aiGreetingA?: string
}

type logState = 'info' | 'success' | 'warning' | 'danger'

interface log {
  job?: MyJobListData
  title: string // 标题
  state: logState // 信息,成功,过滤,出错
  state_name: string // 标签文本
  message?: string // 显示消息
  data?: logData
}

const dialogData = reactive<{ show: boolean, data?: log }>({ show: false })

const data = ref<log[]>([])
const columns: Column<log>[] = [
  {
    key: 'title',
    title: '标题',
    dataKey: 'title',
    width: 200,
    cellRenderer: ({ rowData }) => (
      <a onClick={() => {
        dialogData.show = true
        dialogData.data = rowData
      }}
      >
        {rowData.title}
      </a>
    ),
  },
  {
    key: 'state',
    title: '状态',
    width: 150,
    align: 'center',
    cellRenderer: ({ rowData }) =>
      <ElTag type={rowData.state ?? 'primary'}>{rowData.state_name}</ElTag>,
  },
  {
    key: 'message',
    title: '信息',
    dataKey: 'message',
    width: 360,
    minWidth: 360,
    align: 'left',
  },
]

export function useLog() {
  const add = (job: MyJobListData, err: logErr, logdata?: logData, msg?: string) => {
    const state = !err ? 'success' : err.state
    const message = msg ?? (err ? err.message : undefined)

    data.value.push({
      job,
      title: job.jobName,
      state,
      state_name: err?.name ?? '投递成功',
      message,
      data: logdata,
    })
  }
  const info = (title: string, message: string) => {
    data.value.push({
      title,
      state: 'info',
      state_name: '消息',
      message,
      data: undefined,
    })
  }
  const clear = () => {
    data.value = []
  }

  return {
    columns,
    data,
    clear,
    add,
    info,
    dialogData,
  }
}
