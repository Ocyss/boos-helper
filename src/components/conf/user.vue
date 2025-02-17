<script lang="ts" setup>
import type { CookieInfo } from '@/utils/message/cookie'
import { getStatistics, setStatistics } from '@/hooks/useStatistics'
import { logger } from '@/utils/logger'
import { clearCookie, deleteCookie, getCookieInfo, saveCookie, switchCookie } from '@/utils/message/cookie'
import { setStorage } from '@/utils/message/storage'
import {
  ElAlert,
  ElAvatar,
  ElButton,
  ElDialog,
  ElMessage,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus'
import { computed, ref } from 'vue'

const show = defineModel<boolean>({ required: true })

const { formData } = useConfFormData()
const { userInfo, getUserId } = useUserInfo()
const data = ref<Record<string, CookieInfo>>({})

const tableData = computed(() => Object.values(data.value))

getCookieInfo().then((res) => {
  res = res ?? {}
  logger.debug('账户数据', res)
  data.value = res
})

const currentRow = ref<CookieInfo | undefined>()
const loading = ref(false)

function handleCurrentChange(val: CookieInfo | undefined) {
  currentRow.value = val
}

async function create(change = false) {
  logger.debug('开始创建账户')
  try {
    loading.value = true

    let uid: number | string = getUserId()
    // 如果不切换账号或者
    // 切换账号但是有uid则创建
    if (!change || uid) {
      if (!uid) {
        throw new Error('找不到uid')
      }
      uid = String(uid)

      const val: CookieInfo = {
        uid,
        user: userInfo.value?.showName || userInfo.value?.name || '未知用户',
        avatar: userInfo.value?.tinyAvatar || userInfo.value?.largeAvatar || '',
        remark: '',
        gender: userInfo.value?.gender === 0 ? 'man' : 'woman',
        flag: userInfo.value?.studentFlag ? 'student' : 'staff',
        date: new Date().toLocaleString(),
        form: jsonClone(formData),
        statistics: await getStatistics(),
      }
      data.value[uid] = val

      await saveCookie(val)
      ElMessage.success(change ? '已保存当前账号，准备切换' : '账号已保存，正在清空Cookie并刷新页面')
      if (!change) {
        setTimeout(() => window.location.reload(), 1500)
      }
    }

    await clearCookie()
  }
  catch (error) {
    logger.error('创建账号失败', error)
    ElMessage.error(`创建账号失败: ${error}`)
  }
  finally {
    loading.value = false
  }
}

async function change() {
  try {
    loading.value = true
    const targetAccount = jsonClone(currentRow.value)
    if (!targetAccount) {
      ElMessage.error('请先选择要切换的账号')
      return
    }

    // 保存当前账号状态
    await create(true)
    currentRow.value = undefined

    // 恢复目标账号的配置
    if (targetAccount.form) {
      await setStorage(formDataKey, targetAccount.form)
    }

    if (targetAccount.statistics) {
      await setStatistics(targetAccount.statistics)
    }

    // 切换到目标账号
    await switchCookie(targetAccount.uid)

    ElMessage.success('账号切换成功，即将刷新页面')
    setTimeout(() => window.location.reload(), 1500)
  }
  catch (error) {
    logger.error('账号切换失败', error)
    ElMessage.error('账号切换失败，请重试')
  }
  finally {
    loading.value = false
  }
}

async function del(d: CookieInfo) {
  try {
    delete data.value[d.uid]
    await deleteCookie(d.uid)
    ElMessage.success('账号删除成功')
  }
  catch (error) {
    logger.error('删除账号失败', error)
    ElMessage.error('删除账号失败，请重试')
  }
}
</script>

<template>
  <ElDialog
    v-model="show"
    title="账户配置"
    width="70%"
    align-center
    destroy-on-close
    :z-index="20"
  >
    <ElAlert
      title="使用该功能将会明文存储cookie信息,可能包含隐私信息"
      type="warning"
      style="margin: 6px 0"
    />
    <ElAlert
      title="每个用户都有自己的相关配置但历史投递等信息将全局共享,如果切换后是未登陆状态可能ck不完整或过期再次登陆即可(不要删除,不然配置会丢失)"
      type="info"
      style="margin: 6px 0"
    />
    <ElTable
      :data="tableData"
      style="width: 100%"
      highlight-current-row
      table-layout="auto"
      @current-change="handleCurrentChange"
    >
      <ElTableColumn type="index" width="40" />
      <ElTableColumn label="账户">
        <template #default="scope">
          <div style="align-items: center; display: flex">
            <ElAvatar :src="scope.row.avatar" :size="30" />
            <span style="margin-left: 8px">{{ scope.row.user }}</span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="性别" align="center">
        <template #default="scope">
          <ElTag
            round
            effect="dark"
            style="border-style: none"
            :color="scope.row.gender === 'man' ? '#9BC1FE' : '#FFBDEB'"
          >
            {{ scope.row.gender === "man" ? "可爱男孩" : "温柔女孩" }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="身份" align="center">
        <template #default="scope">
          <ElTag
            effect="dark"
            round
            style="border-style: none"
            :type="scope.row.flag === 'student' ? 'success' : 'warning'"
          >
            {{ scope.row.flag === "student" ? "哈巴学生" : "无情社畜" }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="date" label="上次登录" />
      <ElTableColumn fixed="right" label="操作">
        <template #default="scope">
          <ElButton link type="primary" size="small" disabled>
            导出
          </ElButton>
          <ElButton
            link
            type="primary"
            size="small"
            @click="() => del(scope.row)"
          >
            删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <template #footer>
      <div>
        <ElButton @click="show = false">
          取消
        </ElButton>
        <ElPopconfirm
          title="确认后将保存数据退出账户并自动刷新"
          @confirm="() => create()"
        >
          <template #reference>
            <ElButton type="primary" :loading="loading">
              新建&登出
            </ElButton>
          </template>
        </ElPopconfirm>
        <ElButton
          type="primary"
          :disabled="!currentRow"
          :loading="loading"
          @click="change"
        >
          切换
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped></style>
