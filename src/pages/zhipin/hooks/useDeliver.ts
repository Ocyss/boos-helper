import type { logData, logErr } from '@/hooks/useLog'
import { createHandle, sendPublishReq } from '@/hooks/useApplying'
import { useCommon } from '@/hooks/useCommon'
import { useConfFormData } from '@/hooks/useConfForm'

import { jobList } from '@/hooks/useJobList'
import { useLog } from '@/hooks/useLog'
import { useStatistics } from '@/hooks/useStatistics'
import { delay, notification } from '@/utils'
import { logger } from '@/utils/logger'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

const total = ref(0)
const current = ref(0)
const log = useLog()
const { todayData } = useStatistics()
const { deliverStop } = useCommon()
const { formData } = useConfFormData()

async function jobListHandle() {
  log.info('获取岗位', `本次获取到 ${jobList._list.value.length} 个`)
  total.value = jobList._list.value.length
  const h = createHandle()
  jobList._list.value.forEach((v) => {
    switch (v.status.status) {
      case 'success':
      case 'warn':
        break
      case 'pending':
      case 'wait':
      case 'running':
      case 'error':
      default:
        v.status.setStatus('wait', '等待中')
    }
  })
  for (const [index, data] of jobList._list.value.entries()) {
    current.value = index
    if (deliverStop.value) {
      log.info('暂停投递', `剩余 ${jobList._list.value.length - index} 个未处理`)
      return
    }
    if (data.status.status !== 'wait')
      continue

    try {
      data.status.setStatus('running', '处理中')
      const ctx: logData = { listData: data }
      try {
        await h.before({ data }, ctx)
        await sendPublishReq(data)
        await h.after({ data }, ctx)
        log.add(data, null, ctx, ctx.message)
        todayData.success++
        data.status.setStatus('success', '投递成功')
        logger.warn('成功', ctx)
        ctx.state = '成功'
        if (todayData.success >= formData.deliveryLimit.value) {
          if (formData.notification.value) {
            await notification(`投递到达上限 ${formData.deliveryLimit.value}，已暂停投递`)
          }
          ElMessage.info(`投递到达上限 ${formData.deliveryLimit.value}，已暂停投递`)
          deliverStop.value = true
          return
        }
      }
      catch (e: any) {
        data.status.setStatus(e.state === 'warning' ? 'warn' : 'error', e.name as string ?? '没有消息')
        log.add(data, e as logErr, ctx)
        logger.warn('过滤', ctx)
        ctx.state = '过滤'
        ctx.err = e.message ?? ''
      }
      finally {
        await h.record(ctx)
      }
    }
    catch (e) {
      data.status.setStatus('error', '未知报错')
      logger.error('未知报错', e, data)
      if (formData.notification.value) {
        await notification('未知报错')
      }
      ElMessage.error('未知报错')
    }
    finally {
      todayData.total++
      await delay(formData.delay.deliveryInterval)
    }
  }
}

export function useDeliver() {
  return {
    createHandle,
    jobListHandle,
    total,
    current,
  }
}
