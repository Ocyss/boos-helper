<script lang="tsx" setup>
import type { MyJobListData } from '@/hooks/useJobList'
import type { prompt } from '@/hooks/useModel/type'
import type { FormInfoAi } from '@/types/formData'
import type { CheckboxValueType, TableTooltipData } from 'element-plus'
import JobCard from '@/components/JobCard.vue'
import { formInfoData, useConfFormData } from '@/hooks/useConfForm'
import { jobList } from '@/hooks/useJobList'
import { getGpt, useModel } from '@/hooks/useModel'
import {
  ElMessage,
  ElText,
} from 'element-plus'
import { ref } from 'vue'

const props = defineProps<{
  data: 'aiGreeting' | 'aiFiltering' | 'aiReply'
}>()

const { formData, confSaving } = useConfFormData()
const { modelData } = useModel()
const show = defineModel<boolean>({ required: true })
const model = ref(formData[props.data].model)
const singleMode = ref(!Array.isArray(formData[props.data].prompt))
const role = ['system', 'user', 'assistant'].map((item) => {
  return {
    label: item,
    value: item,
  }
})

let _message = formData[props.data].prompt

if (Array.isArray(_message)) {
  _message = [..._message].map(item => ({ ...item }))
}

const message = ref<string | prompt>(_message)

function inputExample() {
  message.value = (formInfoData[props.data] as FormInfoAi).example[
    singleMode.value ? 0 : 1
  ]
}
function changeMode(v: boolean | string | number | undefined) {
  if (v) {
    message.value = ''
  }
  else {
    message.value = [
      { role: 'user', content: '' },
      { role: 'assistant', content: '' },
      { role: 'user', content: '' },
    ]
  }
}

function removeMessage(item: prompt[number]) {
  if (Array.isArray(message.value)) {
    message.value = message.value.filter(v => v !== item)
  }
}

function addMessage() {
  if (Array.isArray(message.value)) {
    message.value.push({ role: 'user', content: '' })
  }
}

const testDialog = ref(false)

interface TestData {
  job: MyJobListData
  testContent: Array<{ time: string, prompt?: string, reasoning_content?: string, content?: string }>
  checked: CheckboxValueType
}

const testData = reactive<Array<TestData>>([])

function test() {
  testDialog.value = true
}

const testJobLoading = ref(false)
const testJobStop = ref(true)

async function addTestJob() {
  testJobLoading.value = true
  try {
    let count = 0
    for (const item of jobList._list.value) {
      if (testData.some(v => v.job.encryptJobId === item.encryptJobId)) {
        continue
      }
      if (item.card == null) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await item.getCard()
      }
      testData.push({ job: item, testContent: [], checked: false })
      count++
      if (count > 3) {
        break
      }
    }
  }
  finally {
    testJobLoading.value = false
  }
}

async function testJob() {
  if (!testJobStop.value) {
    testJobStop.value = true
    return
  }
  testJobLoading.value = true
  testJobStop.value = false
  const md = modelData.value.find(
    v => model.value === v.key,
  )
  if (!model.value || !md) {
    ElMessage.warning('请在上级弹窗右上角选择模型')
    return
  }
  try {
    const gpt = getGpt(md, message.value)
    const handle = async (item: TestData) => {
      if (testJobStop.value) {
        return
      }
      const { content, prompt, reasoning_content } = await gpt.message({
        data: {
          data: item.job,
          card: item.job.card,
        },
      })
      item.testContent.push({
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        prompt,
        reasoning_content,
        content,
      })
    }

    for (let i = 0; i < testData.length; i += 4) {
      const batch = testData.slice(i, i + 4)
      await Promise.all(batch.map(handle))
    }
  }
  catch (err: any) {
    console.error(err)
    ElMessage.error(err.message)
  }
  finally {
    testJobLoading.value = false
    testJobStop.value = true
  }
}

function Row({ cells, rowData }: { cells: any[], rowData: TestData }) {
  if (rowData.testContent.length > 0) {
    return (
      <div class="test-content-wrapper">
        <div class="test-content-list">
          {rowData.testContent.slice(-3).map(item => (
            <div class="test-content-item" key={item.time}>
              <div class="test-content-time">{item.time}</div>
              <ElText class="test-content-prompt" line-clamp="3">{item.prompt}</ElText>
              <ElText class="test-content-content" line-clamp="3">{item.content}</ElText>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return cells
}
Row.inheritAttrs = false

async function savePrompt() {
  if (model.value == null) {
    ElMessage.warning('请在右上角选择模型')
    return
  }
  formData[props.data].model = model.value
  formData[props.data].prompt = message.value
  await confSaving()
  ElMessage.success('保存成功')
  // show.value = false
}
</script>

<template>
  <ElDialog
    v-model="show"
    :title="formInfoData[data].label"
    width="70%"
    align-center
    destroy-on-close
    :z-index="20"
  >
    <div class="select-form-box">
      <el-radio-group
        v-model="singleMode"
        size="large"
        @update:model-value="changeMode"
      >
        <el-radio-button label="单对话模式" :value="true" />
        <el-radio-button label="多对话模式" :value="false" />
      </el-radio-group>
      <ElButton @click="inputExample">
        填入示例值
      </ElButton>
      <ElSelectV2
        v-model="model"
        :options="modelData"
        :props="{ label: 'name', value: 'key' }"
        placeholder="选择模型"
        style="width: 35%"
      />
    </div>

    <ElText style="margin: 20px 0" tag="div">
      使用
      <el-link
        type="primary"
        href="https://ygorko.github.io/mitem/"
        target="_blank"
      >
        mitem
      </el-link>
      来渲染模板。在多对话模式下，只有最后的消息会使用模板。
      <ElLink type="primary" href="#" target="_blank">
        变量表
      </ElLink>
      <br>
      推荐阅读
      <ElLink
        type="primary"
        href="https://langgptai.feishu.cn/wiki/RXdbwRyASiShtDky381ciwFEnpe"
        target="_blank"
      >
        《LangGPT》
      </ElLink>
      的提示词文档学习 ( 示例提示词写的并不好,欢迎AI大佬来提pr )
    </ElText>

    <ElInput
      v-if="singleMode"
      v-model="message as string"
      style="width: 100%"
      :autosize="{ minRows: 10, maxRows: 18 }"
      type="textarea"
    />
    <el-form
      v-else
      v-model="message as string"
      label-width="auto"
      class="demo-dynamic"
    >
      <el-form-item v-for="(item, index) in (message as prompt)" :key="index">
        <template #label>
          <ElSelectV2
            v-model="item.role"
            :options="role"
            style="width: 140px"
          />
        </template>
        <div
          class="select-form-box"
          style="width: 100%; align-items: flex-start"
        >
          <ElInput
            v-model="item.content"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 8 }"
          />
          <ElButton
            style="margin-left: 10px"
            @click.prevent="removeMessage(item)"
          >
            删除
          </ElButton>
        </div>
      </el-form-item>
      <el-form-item>
        <ElButton @click="addMessage">
          添加消息
        </ElButton>
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <ElButton @click="show = false">
          关闭
        </ElButton>
        <ElButton type="info" @click="test">
          测试
        </ElButton>
        <ElButton
          type="primary"
          @click="
            savePrompt
          "
        >
          保存
        </ElButton>
      </div>
    </template>
  </ElDialog>
  <ElDialog
    v-model="testDialog"
    title="Prompt 测试"
    width="800"
    height="80vh"
    align-center
    draggable
    :z-index="21"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :modal="false"
  >
    <el-space direction="horizontal" size="large">
      <ElButton :loading="testJobLoading" @click="addTestJob">
        添加4个页面岗位
      </ElButton>
      <ElButton type="primary" @click="testJob">
        {{ testJobStop ? '测试' : '停止' }}
      </ElButton>
    </el-space>
    <el-table :data="testData" style="width: 100%">
      <el-table-column type="expand">
        <template #default="scope">
          <div class="test-content-wrapper">
            <div class="test-content-list">
              <div v-for="item in scope.row.testContent.slice(-3)" :key="item.time" class="test-content-item">
                <div class="test-content-time">
                  {{ item.time }}
                </div>
                <div class="test-content-prompt" :title="item.prompt">
                  {{ item.prompt }}
                </div>
                <div v-if="item.reasoning_content" class="test-content-reasoning-content" :title="item.reasoning_content">
                  {{ item.reasoning_content }}
                </div>
                <div class="test-content-content" :title="item.content">
                  {{ item.content }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="job.jobName" label="岗位名" width="180">
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top" popper-style="padding: 0;">
            <template #default>
              <JobCard :job="scope.row.job" :hover="false" style="width: 300px;" />
            </template>
            <template #reference>
              <div>{{ scope.row.job.jobName }}</div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="job.card.postDescription" label="内容">
        <template #default="scope">
          <div :title="scope.row.job.card.postDescription" style="width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ scope.row.job.card.postDescription }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div>
        <ElButton @click="testDialog = false">
          取消
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style>
.el-alert--info.is-light,
.el-alert--info.is-light .el-alert__description {
  white-space: pre-line;
}
.select-form-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.test-content-wrapper {
  padding: 8px;
}
.test-content-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.test-content-item {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.test-content-time,
.test-content-prompt,
.test-content-reasoning-content {
  width: 180px;
  border-right: 1px solid #dcdfe6;
  padding: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.test-content-time,.test-content-prompt{
  width: 130px;
}
.test-content-reasoning-content {
  width: 200px;
}
.test-content-content {
  flex: 1;
  padding: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.el-table-v2__row-depth-0 {
  height: 50px;
}

.el-table-v2__cell-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
