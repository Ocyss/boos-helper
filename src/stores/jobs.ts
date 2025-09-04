import { checkJobCache } from '@/composables/useApplying'
import { requestDetail } from '@/composables/useApplying/utils'
import { useHookVueData } from '@/composables/useVue'
import { ref } from 'vue'

export type EncryptJobId = bossZpJobItemData['encryptJobId']
export type JobStatus = 'pending' | 'wait' | 'running' | 'success' | 'error' | 'warn'
export type MyJobListData = bossZpJobItemData & {
  card?: bossZpDetailData & bossZpCardData
  status: {
    status: JobStatus
    msg: string
    setStatus: (status: JobStatus, msg?: string) => void
  }
  getCard: () => Promise<bossZpCardData>
}

export class JobList {
  private _vue_jobList = ref<bossZpJobItemData[]>([])

  _list = ref<Array<MyJobListData>>([])
  _map = reactive<Record<EncryptJobId, MyJobListData>>({})

  initJobList = useHookVueData('#wrap .page-job-wrapper,.job-recommend-main,.page-jobs-main', 'jobList', this._vue_jobList, (v) => {
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
        // 检查缓存
        const cacheCheck = checkJobCache(item.encryptJobId)

        val = {
          ...item,
          status: {
            status: cacheCheck.hasCache ? cacheCheck.cacheResult!.status : 'pending',
            msg: cacheCheck.hasCache ? `${cacheCheck.cacheResult!.message} (缓存)` : '未开始',
            setStatus: (status: JobStatus, msg?: string) => {
              this._map[item.encryptJobId].status.status = status
              this._map[item.encryptJobId].status.msg = msg ?? ''
            },
          },
          getCard: async () => {
            // TODO： 将 bossZpCardData 转换为 bossZpDetailData
            const data = (await requestDetail({
              lid: item.lid,
              securityId: item.securityId,
            })).data.zpData
            const card: bossZpDetailData & bossZpCardData = {
              ...data,
              jobName: data.jobInfo.jobName,
              postDescription: data.jobInfo.postDescription,
              encryptJobId: data.jobInfo.encryptId,
              atsDirectPost: false,
              atsProxyJob: data.jobInfo.proxyJob === 1,
              salaryDesc: data.jobInfo.salaryDesc,
              cityName: data.jobInfo.locationName,
              experienceName: data.jobInfo.experienceName,
              degreeName: data.jobInfo.degreeName,
              jobLabels: data.jobInfo.showSkills || [],
              address: data.jobInfo.address,
              lid: data.lid,
              sessionId: data.sessionId || '',
              securityId: data.securityId,
              encryptUserId: data.jobInfo.encryptUserId,
              bossName: data.bossInfo.name,
              bossTitle: data.bossInfo.title,
              bossAvatar: data.bossInfo.tiny,
              online: data.bossInfo.bossOnline,
              certificated: data.bossInfo.certificated,
              activeTimeDesc: data.bossInfo.activeTimeDesc,
              brandName: data.brandComInfo.brandName,
              canAddFriend: true,
              friendStatus: 0,
              isInterested: data.relationInfo.interestJob ? 1 : 0,
              login: true,
            }
            this._map[item.encryptJobId].card = card
            return card
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
