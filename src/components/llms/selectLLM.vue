<script lang="tsx" setup>
import type { MyJobListData } from '@/hooks/useJobList'
import type { prompt } from '@/hooks/useModel/type'
import type { FormInfoAi } from '@/types/formData'
import type { CheckboxValueType } from 'element-plus'
import JobCard from '@/components/JobCard.vue'
import { parseFiltering } from '@/hooks/useApplying/utils'
import { formInfoData, useConfFormData } from '@/hooks/useConfForm'
import { jobList } from '@/hooks/useJobList'
import { getGpt, llmsIcons, useModel } from '@/hooks/useModel'
import {
  ElMessage,
  ElMessageBox,
  ElText,
} from 'element-plus'
import { ref } from 'vue'

const props = defineProps<{
  data: 'aiGreeting' | 'aiFiltering' | 'aiReply'
}>()

const { signedKey } = useSignedKey()
const { formData, confSaving } = useConfFormData()
const { modelData } = useModel()

const show = defineModel<boolean>({ required: true })
const model = ref(formData[props.data].model)
const singleMode = ref(formData[props.data].vip || signedKey.value != null ? 'vip' as const : !Array.isArray(formData[props.data].prompt))

const score = ref(props.data === 'aiFiltering' ? (formData[props.data].score ?? 10) : 10)

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
  key: string
  job: MyJobListData
  checked: CheckboxValueType
  loading: boolean
}
interface TestContent {
  time: string
  prompt?: string
  reasoning_content?: string | null
  content?: string
}

const testData = reactive<Array<TestData>>([])
const expandTestRowKeys = ref<string[]>([])
const testDataContent = reactive<Record<string, TestContent[]>>({})

function handleExpandChange(row: TestData) {
  logger.info('handleExpandChange', row)
  if (expandTestRowKeys.value.includes(row.key)) {
    expandTestRowKeys.value = expandTestRowKeys.value.filter(v => v !== row.key)
  }
  else {
    expandTestRowKeys.value.push(row.key)
  }
}

function test() {
  testDialog.value = true
}

const testJobLoading = ref(false)
const testJobStop = ref(true)

async function addTestJob(n: number) {
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
      testData.push({ key: item.encryptJobId, job: item, checked: false, loading: false })
      testDataContent[item.encryptJobId] = []
      count++
      if (count >= n) {
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
  if (singleMode.value !== 'vip' && (!model.value || !md)) {
    ElMessage.warning('请在上级弹窗右上角选择模型')
    return
  }
  try {
    const gpt = getGpt(md!, message.value, singleMode.value === 'vip')
    const handle = async (item: TestData) => {
      if (testJobStop.value) {
        return
      }
      try {
        item.loading = true
        let { content, prompt, reasoning_content } = await gpt.message({
          data: {
            data: item.job,
            card: item.job.card!,
          },
          test: true,
          json: props.data === 'aiFiltering',
        }, props.data)
        if (props.data === 'aiFiltering' && content) {
          const { message } = parseFiltering(content)
          content = message ?? content
        }
        testDataContent[item.key].push({
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          prompt,
          reasoning_content,
          content,
        })
      }
      catch (err: any) {
        console.error(err)
        ElMessage.error(err.message)
      }
      finally {
        item.loading = false
      }
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

async function savePrompt() {
  if (singleMode.value !== 'vip') {
    if (model.value == null) {
      ElMessage.warning('请在右上角选择模型')
      return
    }
    formData[props.data].model = model.value
  }
  else {
    formData[props.data].vip = true
  }
  formData[props.data].prompt = message.value
  if (props.data === 'aiFiltering') {
    formData[props.data].score = score.value
  }
  await confSaving()
  // ElMessage.success('保存成功')
  // show.value = false
}

async function copyOnlineResume() {
  const resume = await getUserResumeString({})

  await ElMessageBox({
    title: '在线简历',
    message: () => {
      return (
        <el-input
          style="width: 100%"
          model-value={resume}
          readonly={true}
          autosize={{ minRows: 4, maxRows: 8 }}
          type="textarea"
        >
        </el-input>
      )
    },
    customStyle: {
      width: '100%',
    },
    showCancelButton: true,
    confirmButtonText: '复制到剪切板',
    cancelButtonText: '取消',
  }).then(() => {
    return navigator.clipboard.writeText(resume)
  }).catch(() => {

  })
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
    <div v-if="data === 'aiFiltering'">
      <el-form-item label="过滤分数">
        <el-input-number v-model="score" :precision="0" :min="-100" :max="100" size="small" placeholder="请输入分数" />
      </el-form-item>
    </div>
    <div class="select-form-box">
      <el-radio-group
        v-model="singleMode"
        size="large"
        @update:model-value="changeMode"
      >
        <el-radio-button :disabled="signedKey == null" label="会员模式(无需Prompt)" value="vip" />
        <el-radio-button label="单对话模式" :value="true" />
        <el-radio-button label="多对话模式" :value="false" />
      </el-radio-group>
      <el-space>
        <ElButton v-if="singleMode !== 'vip'" @click="inputExample">
          填入示例值
        </ElButton>
        <ElButton @click="copyOnlineResume">
          复制在线简历
        </ElButton>
      </el-space>
      <ElSelectV2
        v-if="singleMode !== 'vip'"
        v-model="model"
        :options="modelData"
        :props="{ label: 'name', value: 'key' }"
        placeholder="选择模型"
        style="width: 35%"
      >
        <template #default="{ item }">
          <div style="display: flex;">
            <span v-if="item.vip != null" style="align-items: center;display: inline-flex;margin-right: 6px;" v-html="llmsIcons.vip" />
            <span>{{ item.name }}</span>
          </div>
        </template>
        <template #label="{ label, value }">
          <div style="display: flex;">
            <span v-if="value.startsWith('vip-')" style="align-items: center;display: inline-flex;margin-right: 6px;" v-html="llmsIcons.vip" />
            <span>{{ label }}</span>
          </div>
        </template>
      </ElSelectV2>
    </div>

    <ElText v-if="singleMode !== 'vip'" style="margin: 20px 0" tag="div">
      <Alert v-if="model?.startsWith('vip-')" id="vip-alert" title="注意" type="warning">
        会员模型暂时不支持输出 思考过程, 比如deepseekR1，但是不影响模型能力
      </Alert>
      使用
      <el-link
        type="primary"
        href="https://ygorko.github.io/mitem/"
        target="_blank"
      >
        mitem
      </el-link>
      来渲染模板。在多对话模式下，只有最后的消息会使用模板。
      <ElLink type="primary" href="https://github.com/Ocyss/boos-helper/blob/master/src/types/bossData.d.ts" target="_blank">
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
    <ElText v-else style="margin: 20px 0" tag="div">
      仅需输入自然语言作为额外要求，其余Prompt将由后台全自动生成. 比如:
      <br>
      <template v-if="data === 'aiGreeting'">
        使用“你好”作为开头, 稍微幽默风趣一些
      </template>
      <template v-else-if="data === 'aiFiltering'">
        我喜好AI相关的岗位, 喜欢 Go，Rust，Python，TypeScript语言，不喜欢Java，C++，PHp，Nodejs,Javascript
      </template>
    </ElText>
    <ElInput
      v-if="singleMode === 'vip' || singleMode"
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
      <ElButton :loading="testJobLoading" @click="addTestJob(1)">
        添加1个
      </ElButton>
      <ElButton :loading="testJobLoading" @click="addTestJob(4)">
        添加4个
      </ElButton>
      <ElButton type="primary" @click="testJob">
        {{ testJobStop ? '测试' : '停止' }}
      </ElButton>
    </el-space>
    <el-table :data="testData" style="width: 100%">
      <el-table-column type="expand" row-key="key" :expand-row-keys="expandTestRowKeys" @expand-change="handleExpandChange">
        <template #default="scope">
          <div class="test-content-wrapper">
            <div class="test-content-list">
              <div v-for="item in testDataContent[scope.row.key].slice(-3)" :key="item.time" class="test-content-item">
                <div class="test-content-time">
                  {{ item.time }}
                </div>
                <div v-if="item.prompt" class="test-content-prompt" :title="item.prompt">
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
              <div style="display: flex;align-items: center;">
                <svg v-if="scope.row.loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><!-- Icon from All by undefined - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0" /><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" /></path><path stroke-dasharray="64" stroke-dashoffset="64" stroke-opacity=".3" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0" /></path></g></svg>
                {{ scope.row.job.jobName }}
              </div>
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

.el-message-box__message{
  width: 100%;
}
</style>
