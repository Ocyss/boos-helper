<script lang="ts" setup>
import { getElText } from "@/utils/element";
import { ref } from "vue";
import { ElTag, ElSpace } from "element-plus";
const cards = ref<HTMLDivElement>();
function scroll(e: any) {
  e.preventDefault();
  if (!cards.value) {
    return;
  }
  let left = -e.wheelDelta || e.deltaY / 2;
  cards.value.scrollLeft = cards.value.scrollLeft + left;
}
const _jobList = document.querySelectorAll(
  ".job-card-wrapper:not([state]),.job-card-wrapper[state='wait']"
);
const jobList = Array.from(_jobList).map((e) => {
  return {
    jobName: getElText(".job-name", e),
    jobLabel: Array.from(e.querySelectorAll(".job-info .tag-list li")).map(
      (e) => e.textContent
    ),
    jobArea: getElText(".job-area", e),
    jobSalary: getElText(".salary", e),
    jobTechnology: Array.from(
      e.querySelectorAll(".job-card-footer .tag-list li")
    ).map((e) => e.textContent),
    companyTag: Array.from(e.querySelectorAll(".company-tag-list li"))
      .map((e) => e.textContent)
      .join(", "),
    companyDesc: getElText(".info-desc", e),
    companyAvatar:
      e.querySelector(".company-logo img")?.getAttribute("src") || "",
    companyName: getElText(".company-name a", e),
    hr: getElText(".info-public", e),
  };
});
</script>

<template>
  <div style="order: -1">
    <div ref="cards" @wheel.stop="scroll" class="mini-card-grid">
      <div class="mini-card" v-for="v in jobList">
        <div class="mini-card-tag">{{ v.companyTag }}</div>
        <h3 class="mini-card-title">{{ v.jobName }}</h3>
        <div>
          <el-space :size="3" wrap>
            <el-tag
              size="small"
              v-for="tag in v.jobLabel"
              effect="plain"
              type="warning"
            >
              {{ tag }}
            </el-tag>
          </el-space>
          <el-space :size="3" spacer="|" wrap>
            <el-tag
              size="small"
              v-for="tag in v.jobTechnology"
              effect="plain"
              type="success"
            >
              {{ tag }}
            </el-tag>
          </el-space>
        </div>
        <div class="mini-card-footer">{{ v.companyDesc }}</div>
        <div class="author-row">
          <img
            alt=""
            class="avatar"
            height="80"
            :src="v.companyAvatar"
            width="80"
          />
          <span class="company-name">{{ v.companyName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// https://css-tricks.com/

.mini-card-grid {
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
.mini-card {
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
      min-width: 220px;
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
.mini-card-tag {
  display: block;
  margin: 0 0 0.25rem;
  color: #777;
  font-size: 0.7rem;
}
.mini-card-title {
  font-size: 1.3rem;
  margin: 0 0 1rem;
}
.mini-card-footer {
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
