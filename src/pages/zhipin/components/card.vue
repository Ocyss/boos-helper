<script lang="ts" setup>
import type { EncryptJobId } from '@/stores/jobs'
import { jobList } from '@/stores/jobs'
import { ref } from 'vue'
import { useDeliver } from '../hooks/useDeliver'

const deliver = useDeliver()
const jobSetRef = ref<Record<EncryptJobId, Element | ComponentPublicInstance | null>>({})
const autoScroll = ref(true)
const cards = ref<HTMLDivElement>()

function scroll(e: any) {
  e.preventDefault()
  if (!cards.value) {
    return
  }
  const left = -e.wheelDelta || e.deltaY / 2
  cards.value.scrollLeft = cards.value.scrollLeft + left
  autoScroll.value = false
}

function scrollHandler() {
  if (!deliver.currentData?.encryptJobId) {
    return
  }
  const d = jobSetRef.value[deliver.currentData?.encryptJobId ?? '']
  if (!d) {
    return
  }
  if ('scrollIntoView' in d) {
    d.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
  else if ('$el' in d) {
    d?.$el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
}

watch(() => deliver.currentData, () => {
  if (autoScroll.value) {
    scrollHandler()
  }
})
</script>

<template>
  <div style="order: -1" class="boss-helper-card">
    <div ref="cards" class="card-grid" @wheel.stop="scroll">
      <JobCard v-for="job in jobList.list" :ref="(ref) => { jobSetRef[job.encryptJobId] = ref }" :key="job.encryptJobId" :job="job" hover />
    </div>
    <ElSwitch
      v-model="autoScroll"
      inline-prompt
      active-text="自动滚动"
      inactive-text="自动滚动"
      @change="(v) => {
        if (v) {
          scrollHandler()
        }
      }"
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
  scrollbar-color: #c6c6c6 #e9e9e9;
  scrollbar-gutter: always;
  padding: 3rem 0 3rem 2rem;
  margin: 0;
  display: flex;
  color: #000;
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

html.dark {
  .card-grid {
    scrollbar-color: #666 #201c29;
    color: #fff;
    &::-webkit-scrollbar-thumb {
      background: #434343;
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
}
</style>
