import { requestCard } from '@/hooks/useApplying'
import { useHookVueData } from '@/hooks/useVue'
import { ref } from 'vue'

export type EncryptJobId = JobListData['encryptJobId']
export type JobStatus = 'pending' | 'wait' | 'running' | 'success' | 'error' | 'warn'
export type MyJobListData = JobListData & {
  card?: JobCard
  status: {
    status: JobStatus
    msg: string
    setStatus: (status: JobStatus, msg?: string) => void
  }
  getCard: () => Promise<JobCard>
}

export class JobList {
  private _vue_jobList = ref<JobListData[]>([])

  _list = ref<Array<MyJobListData>>([])
  _map = reactive<Record<EncryptJobId, MyJobListData>>({})

  initJobList = useHookVueData('#wrap .page-job-wrapper,.job-recommend-main', 'jobList', this._vue_jobList, (v) => {
    logger.info('初始化岗位列表', v)

    const jobSet = this._list.value.reduce((acc, item) => {
      acc.set(item.encryptJobId, item)
      return acc
    }, new Map<EncryptJobId, MyJobListData>())

    Object.assign(this._map, {})

    this._list.value = v.map((item) => {
      let val: MyJobListData
      if (jobSet.has(item.encryptJobId)) {
        val = jobSet.get(item.encryptJobId)!
      }
      else {
        val = {
          ...item,
          status: {
            status: 'pending',
            msg: '未开始',
            setStatus: (status: JobStatus, msg?: string) => {
              this._map[item.encryptJobId].status.status = status
              this._map[item.encryptJobId].status.msg = msg ?? ''
            },
          },
          getCard: async () => {
            const cardResp = await requestCard({
              lid: item.lid,
              securityId: item.securityId,
            })
            this._map[item.encryptJobId].card = cardResp.data.zpData.jobCard
            return cardResp.data.zpData.jobCard
          },
        }
      }
      this._map[item.encryptJobId] = val
      return val
    })
  })

  get(encryptJobId: EncryptJobId): MyJobListData | undefined {
    return this._map[encryptJobId]
  }

  set(encryptJobId: EncryptJobId, val: MyJobListData) {
    this._map[encryptJobId] = val
  }

  get list() {
    return this._list.value
  }

  get map() {
    return this._map.value
  }
}

export const jobList = new JobList()

window.__q_jobList = jobList
