import { useMap } from '@/hooks/useMap'
import { useHookVueData } from '@/hooks/useVue'
import { ref } from 'vue'

const jobList = ref<JobList>([])
const jobMap = useMap<string, { state: string, msg: string }>() // encryptJobId
const init = useHookVueData('#wrap .page-job-wrapper', 'jobList', jobList)

export function useJobList() {
  return {
    jobList,
    jobMap,
    initJobList: init,
  }
}
