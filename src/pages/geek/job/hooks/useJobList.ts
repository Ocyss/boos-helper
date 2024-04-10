import { useHookVueData } from "@/hooks/useVue";
import { useMap } from "@/hooks/useMap";
import { ref } from "vue";

const jobList = ref<JobList>([]);
const jobMap = useMap<string, { state: string; msg: string }>(); // encryptJobId
const init = useHookVueData("#wrap .page-job-wrapper", "jobList", jobList);

export const useJobList = () => {
  return {
    jobList,
    jobMap,
    initJobList: init,
  };
};
