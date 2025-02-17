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
import JobCard from '@/components/JobCard.vue'
import { ElPopover, ElTag } from 'element-plus'
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
  aiFilteringAraw?: string
  aiFilteringAjson?: object
  aiFilteringAtext?: string
  aiGreetingQ?: string
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

const columns: Column<log>[] = [
  {
    key: 'title',
    title: '标题',
    dataKey: 'title',
    width: 200,
    cellRenderer: ({ rowData }) => (
      rowData.job != null
        ? (
            <ElPopover placement="top" popper-style="padding: 0;">
              {{
                default: () => <JobCard job={rowData.job} hover={false} style="width: 300px" />,
                reference: () => <div>{rowData.title}</div>,
              }}
            </ElPopover>
          )
        : <div>{rowData.title}</div>
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

const dataOld = ref<log[]>([])
const data = ref<log[]>([
  {
    title: '嘿嘿嘿',
    state: 'info',
    state_name: '消息',
    message: '目前没有投递日志啦',
  },
  {
    title: '啦啦啦',
    state: 'success',
    state_name: '消息',
    message: '要查看其他日志请点击右上角的悬浮按钮',
  },
])

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
    dataOld.value = []
    data.value = []
  }
  const reset = () => {
    dataOld.value = data.value
    data.value = []
  }

  const Row = ({ cells }: { cells: any, rowData: log }) => {
    // if (rowData.data) return h("div", {}, rowData.data);
    return cells
  }

  Row.inheritAttrs = false
  return {
    columns,
    data,
    dataOld,
    clear,
    reset,
    add,
    info,
    Row,
  }
}
