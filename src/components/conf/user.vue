<script lang="ts" setup>
import type { FormData, Statistics } from '@/types/formData'
import { logger } from '@/utils/logger'
import { getStorage } from '@/utils/storage'
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
import { computed, reactive, ref, toRaw } from 'vue'

const confUserKey = 'sync:conf-user'

const show = defineModel<boolean>({ required: true })
interface Data {
  uid: string
  user: string
  avatar: string
  remark: string
  gender: 'man' | 'woman'
  flag: 'student' | 'staff'
  date: string
  cookie: string
  form?: FormData
  statistics?: Statistics
}

const data = reactive(await getStorage<{ [keys: string]: Data }>(confUserKey, {}))
const tableData = computed<Data[]>(() => Object.values(data))
logger.debug('账户数据', toRaw(data))

const currentRow = ref<Data | undefined>()

function handleCurrentChange(val: Data | undefined) {
  currentRow.value = val
}

async function create(_flag = true) {
//   logger.debug("开始创建账户");
//   try {
//     const list = await new Promise<any[]>((resolve, reject) => {
//       GM_cookie.list({}, (cookies, error) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(cookies);
//         }
//       });
//     });
//     logger.debug(list);

//     let uid: number | string = useUserId();
//     if (!uid) {
//       throw new Error("找不到uid");
//     }
//     uid = String(uid);
//     data[uid] = {
//       uid,
//       user: userInfo.value?.showName || userInfo.value?.name || "nil",
//       avatar: userInfo.value?.tinyAvatar || userInfo.value?.largeAvatar || "",
//       remark: "",
//       gender: userInfo.value?.gender === 0 ? "man" : "woman",
//       flag: userInfo.value?.studentFlag ? "student" : "staff",
//       date: new Date().toLocaleString(),
//       cookie: JSON.stringify(list),
//       form: toRaw(formData),
//       statistics: toRaw(todayData),
//     };
//     GM_setValue(confUserKey, data);
//     await Promise.all(
//       list.map((item) => GM_cookie.delete({ name: item.name }))
//     );
//     if (flag) {
//       ElMessage.success("创建成功,开始清空ck并刷新");
//       window.location.reload();
//     }
//   } catch (e) {
//     ElMessage.error("遇到错误,请重试," + e);
//     throw new Error("err", { cause: e });
//   }
}

async function change() {
//   try {
//     const data = currentRow.value;
//     if (!data) {
//       ElMessage.error("错误,空状态");
//       return;
//     }
//     currentRow.value = undefined;
//     await create(false);
//     if (data.form) GM_setValue(formDataKey, data.form);
//     if (data.statistics) GM_setValue(todayKey, data.statistics);
//     const ck: any[] = JSON.parse(data.cookie);
//     await Promise.all(ck.map((c) => GM_cookie.set(c)));
//     ElMessage.success("切换完成,即将刷新");
//     window.location.reload();
//   } catch (e: any) {
//     logger.error("错误,切换失败", e);

//     if (e.name !== "err" || !e.name) ElMessage.error("错误,切换失败");
//   }
}
function del(d: Data) {
  delete data[d.uid]
  logger.debug(data)

  // GM_setValue(confUserKey, toRaw(data));
  ElMessage.success('删除成功')
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
            <ElButton type="primary">
              新建&登出
            </ElButton>
          </template>
        </ElPopconfirm>
        <ElButton type="primary" :disabled="!currentRow" @click="change">
          切换
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped></style>
