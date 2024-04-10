<script lang="ts" setup>
import { reactive, ref, watchEffect } from "vue";
import { ElTag, ElSpace } from "element-plus";
import { useJobList } from "./hooks/useJobList";
import { ElTabPane, ElTabs, ElSwitch } from "element-plus";
import { useDeliver } from "./hooks/useDeliver";
const {
  jobList,
  jobMap: { actions: jobMap },
} = useJobList();
const { current } = useDeliver();
const jobListRef = ref<HTMLElement[]>();
const autoScroll = ref(true);
const cards = ref<HTMLDivElement>();
function scroll(e: any) {
  e.preventDefault();
  if (!cards.value) {
    return;
  }
  let left = -e.wheelDelta || e.deltaY / 2;
  cards.value.scrollLeft = cards.value.scrollLeft + left;
  autoScroll.value = false;
}
watchEffect(() => {
  const d = jobListRef.value;
  if (autoScroll.value && d && d.length > current.value) {
    d[current.value].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
});

function stateColor(state?: string): string {
  switch (state) {
    case "wait":
      return "#CECECE";
    case "error":
      return "#e74c3c";
    case "warn":
      return "#f39c12";
    case "success":
      return "#2ecc71";
    case "running":
      return "#98F5F9";
  }
  return "#CECECE";
}
</script>

<template>
  <div style="order: -1">
    <div class="helper">
      <div class="eva">
        <div class="head">
          <div class="eyeChamber">
            <div class="eye"></div>
            <div class="eye"></div>
          </div>
        </div>
        <div class="body">
          <div class="hand"></div>
          <div class="hand"></div>
          <div class="scannerThing"></div>
          <div class="scannerOrigin"></div>
        </div>
      </div>
    </div>

    <div ref="cards" @wheel.stop="scroll" class="card-grid">
      <div
        ref="jobListRef"
        class="card"
        v-for="v in jobList"
        :style="{
          '--state-color': stateColor(jobMap.get(v.encryptJobId)?.state),
          '--state-show': jobMap.has(v.encryptJobId) ? 'block' : 'none',
        }"
      >
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
        <div class="card-status">
          {{ jobMap.get(v.encryptJobId)?.msg || "无内容" }}
        </div>
      </div>
    </div>
    <el-switch
      v-model="autoScroll"
      inline-prompt
      active-text="自动滚动"
      inactive-text="自动滚动"
    />
  </div>
</template>

<style lang="scss" scoped>
// https://css-tricks.com/
// https://uiverse.io/Subaashbala/polite-newt-9

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
  color: #fff;
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
.card {
  --state-color: #f00;
  --state-show: block;
  padding: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(85deg, #434343, #262626);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: 0.2s;
  margin: 0;
  position: relative;
  min-width: 300px;
  min-height: 350px;
  box-shadow: -2rem 0 1rem -2rem #000;
  * {
    user-select: none;
  }
  .card-status {
    position: absolute;
    display: var(--state-show);
    border-radius: 30px;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    background-color: var(--state-color);
    color: #fff;
    padding: 7px 17px;
    text-wrap: nowrap;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 5px;
    left: -6px;
    bottom: -14px;
    transition: all 0.25s ease;
    box-shadow: 1px -7px 12px -2px rgb(167 167 167 / 40%);
  }
  &::after {
    position: absolute;
    content: "";
    display: var(--state-show);
    left: -6px;
    bottom: 18px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 0px solid transparent;
    border-bottom: 10px solid oklch(from var(--state-color) calc(l * 0.75) c h);
  }
  .card-tag {
    display: block;
    margin: 0 0 0.25rem;
    color: #b4b4b4;
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
    color: #a09f9f;
    line-height: 1.3;
    padding-top: 0.5rem;
    .company-name {
      color: #fff;
    }
  }
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

.helper {
  display: none;
  $zoom: 0.3;
  .eva {
    --EVA-ROTATION-DURATION: 4s;
    transform-style: preserve-3d;
    animation: rotateRight var(--EVA-ROTATION-DURATION) linear infinite
      alternate;
  }
  .head {
    position: relative;
    width: calc(6rem * $zoom);
    height: calc(4rem * $zoom);
    border-radius: 48% 53% 45% 55% / 79% 79% 20% 22%;
    background: linear-gradient(to right, white 45%, gray);
  }
  .eyeChamber {
    width: calc(4.5rem * $zoom);
    height: calc(2.75rem * $zoom);
    position: relative;
    left: 50%;
    top: 55%;
    border-radius: 45% 53% 45% 48% / 62% 59% 35% 34%;
    background-color: #0c203c;
    box-shadow: 0px 0px 2px 2px white, inset 0px 0px 0px 2px black;
    transform: translate(-50%, -50%);
    animation: moveRight var(--EVA-ROTATION-DURATION) linear infinite alternate;
  }
  .eye {
    width: calc(1.2rem * $zoom);
    height: calc(1.5rem * $zoom);
    position: absolute;
    border-radius: 50%;
  }
  .eye:first-child {
    left: calc(12px * $zoom);
    top: 50%;
    background: repeating-linear-gradient(
      65deg,
      #9bdaeb 0px,
      #9bdaeb 1px,
      white 2px
    );
    box-shadow: inset 0px 0px 5px #04b8d5, 0px 0px 15px 1px #0bdaeb;
    transform: translate(0, -50%) rotate(-65deg);
  }
  .eye:nth-child(2) {
    right: calc(12px * $zoom);
    top: 50%;
    background: repeating-linear-gradient(
      -65deg,
      #9bdaeb 0px,
      #9bdaeb 1px,
      white 2px
    );
    box-shadow: inset 0px 0px 5px #04b8d5, 0px 0px 15px 1px #0bdaeb;
    transform: translate(0, -50%) rotate(65deg);
  }
  .body {
    width: calc(6rem * $zoom);
    height: calc(8rem * $zoom);
    position: relative;
    margin-block-start: calc(0.25rem * $zoom);
    border-radius: 47% 53% 45% 55% / 12% 9% 90% 88%;
    background: linear-gradient(to right, white 35%, gray);
  }
  .hand {
    position: absolute;
    left: calc(-1.5rem * $zoom);
    top: calc(0.75rem * $zoom);
    width: calc(2rem * $zoom);
    height: calc(5.5rem * $zoom);
    border-radius: 40%;
    background: linear-gradient(to left, white 15%, gray);
    box-shadow: 5px 0px 5px rgba(0, 0, 0, 0.25);
    transform: rotateY(55deg) rotateZ(10deg);
  }
  .hand:first-child {
    animation: compensateRotation var(--EVA-ROTATION-DURATION) linear infinite
      alternate;
  }
  .hand:nth-child(2) {
    left: 92%;
    background: linear-gradient(to right, white 15%, gray);
    transform: rotateY(55deg) rotateZ(-10deg);
    animation: compensateRotationRight var(--EVA-ROTATION-DURATION) linear
      infinite alternate;
  }
  .scannerThing {
    width: 0;
    height: 0;
    position: absolute;
    left: 60%;
    top: 10%;
    border-top: 180px solid #9bdaeb;
    border-left: 250px solid transparent;
    border-right: 250px solid transparent;
    transform-origin: top left;
    mask: linear-gradient(to right, white, transparent 35%);
    animation: glow 2s cubic-bezier(0.86, 0, 0.07, 1) infinite;
  }
  .scannerOrigin {
    position: absolute;
    width: 8px;
    aspect-ratio: 1;
    border-radius: 50%;
    left: 60%;
    top: 10%;
    background: #9bdaeb;
    box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.5);
    animation: moveRight var(--EVA-ROTATION-DURATION) linear infinite;
  }
  @keyframes rotateRight {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(25deg);
    }
  }
  @keyframes moveRight {
    from {
      transform: translate(-50%, -50%);
    }
    to {
      transform: translate(-40%, -50%);
    }
  }
  @keyframes compensateRotation {
    from {
      transform: rotateY(55deg) rotateZ(10deg);
    }
    to {
      transform: rotatey(30deg) rotateZ(10deg);
    }
  }
  @keyframes compensateRotationRight {
    from {
      transform: rotateY(55deg) rotateZ(-10deg);
    }
    to {
      transform: rotateY(70deg) rotateZ(-10deg);
    }
  }
  @keyframes glow {
    from {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    45% {
      transform: rotate(-25deg);
    }
    75% {
      transform: rotate(5deg);
    }
    100% {
      opacity: 0;
    }
  }
}
</style>
