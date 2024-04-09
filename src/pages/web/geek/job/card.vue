<script lang="ts" setup>
import { getElText } from "@/utils/element";
import { ref, onMounted, shallowReadonly, watch } from "vue";
import { ElTag, ElSpace } from "element-plus";
import { jobWrapper } from "./hooks/useVue";
import { JobList } from "@/types/jobList";
import { syncRefs, toRef } from "@vueuse/core";
const cards = ref<HTMLDivElement>();
function scroll(e: any) {
  e.preventDefault();
  if (!cards.value) {
    return;
  }
  let left = -e.wheelDelta || e.deltaY / 2;
  cards.value.scrollLeft = cards.value.scrollLeft + left;
}
function convertVue2ToVue3(vue2Data: any) {
  const reactiveData = shallowReadonly(vue2Data);
  // for (const key in reactiveData) {
  //   if (Object.prototype.hasOwnProperty.call(reactiveData, key)) {
  //     reactiveData[key] = ref(reactiveData[key]);
  //   }
  // }
  return reactiveData;
}
const jobVue = jobWrapper();
const jobList = ref<JobList>(jobVue.jobList);

let originalSet = jobVue.__lookupSetter__("jobList");
Object.defineProperty(jobVue, "jobList", {
  set(val) {
    jobList.value = val;
    originalSet.call(this, val);
  },
});
</script>

<template>
  <div style="order: -1">
    <div ref="cards" @wheel.stop="scroll" class="card-grid">
      <div class="card" v-for="v in jobList">
        <div class="card-tag">
          {{ v.brandIndustry }},{{ v.jobDegree }},{{ v.brandScaleName }}
        </div>
        <h3 class="card-title">{{ v.jobName }}</h3>
        <h3 class="card-salary">{{ v.salaryDesc }}</h3>
        <div>
          <el-space :size="3" spacer="|" wrap>
            <el-tag
              size="small"
              v-for="tag in v.skills"
              effect="plain"
              type="warning"
            >
              {{ tag }}
            </el-tag>
          </el-space>
          <el-space :size="3" wrap>
            <el-tag
              size="small"
              v-for="tag in v.jobLabels"
              effect="plain"
              type="success"
            >
              {{ tag }}
            </el-tag>
          </el-space>
        </div>
        <div class="card-footer">{{ v.welfareList.join(",") }}</div>
        <div class="author-row">
          <img
            alt=""
            class="avatar"
            height="80"
            :src="v.brandLogo"
            width="80"
          />
          <div>
            <span class="company-name">{{ v.brandName }}</span>
            <h4>
              {{ v.cityName }}/{{ v.areaDistrict }}/{{ v.businessDistrict }}
            </h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// https://css-tricks.com/

.card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  margin: 0 0 1.5rem;
  position: relative;
  overflow-x: scroll;
  scrollbar-color: #666 #201c29;
  scrollbar-gutter: always;
  padding: 3rem 0 3rem 2rem;
  margin: 0;
  display: flex;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #434343;
    border-radius: 10px;
    box-shadow: inset 2px 2px 2px hsla(0, 0%, 100%, 0.25),
      inset -2px -2px 2px rgba(0, 0, 0, 0.25);
  }
  &::-webkit-scrollbar-track {
    background: linear-gradient(
      90deg,
      #434343,
      #434343 1px,
      #262626 0,
      #262626
    );
  }
}
.company-name {
  color: #fff;
}
.card {
  padding: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(85deg, #434343, #262626);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: 0.2s;
  margin: 0;

  min-width: 300px;
  min-height: 350px;
  box-shadow: -2rem 0 1rem -2rem #000;
  &:focus-within,
  &:hover {
    transform: translateY(-1rem) rotate(3deg);
  }

  &:focus-within ~ &,
  &:hover ~ & {
    transform: translateX(130px);
  }

  &:first-child:focus-within,
  &:first-child:hover {
    transform: translate(-0.5rem, -1rem) rotate(3deg);
  }

  &:not(:first-child) {
    margin-left: -130px;
    box-shadow: -3rem 0 3rem -3rem #000;
  }

  @media (max-width: 1200px) {
    & {
      min-width: 250px;
    }

    &:not(:first-child) {
      margin-left: -30px;
    }

    &:hover {
      transform: translateY(-1rem);
    }

    &:hover ~ & {
      transform: translateX(30px);
    }
  }
}
.card-tag {
  display: block;
  margin: 0 0 0.25rem;
  color: #777;
  font-size: 0.7rem;
}
.card-title {
  font-size: 1.3rem;
  margin: 0 0 8px;
}
.card-salary {
  font-size: 1.1rem;
  margin: 0 0 1rem;
  color: #ff442e;
}
.card-footer {
  -webkit-margin-before: auto;
  margin-block-start: auto;
  padding: 5px 0;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.author-row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 0.5rem;
  align-items: center;
  color: #565656;
  line-height: 1.3;
  padding-top: 0.5rem;
}
</style>
