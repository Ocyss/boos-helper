import { useHookVueData } from "@/hooks/useVue";
import { ref } from "vue";

const jobList = ref<JobList>([]);

const init = useHookVueData("#wrap .page-job-wrapper", "jobList", jobList);

export const useJobList = () => {
  return {
    jobList,
    initJobList: init,
  };
};
