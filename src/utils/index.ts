import { sendMessage } from './message'

// 通知
export async function notification(content: string, type: 'basic' | 'image' | 'list' | 'progress' = 'basic') {
  return sendMessage('notify', {
    title: 'Boss直聘批量投简历',
    message: content,
    type,
    iconUrl:
      'https://img.bosszhipin.com/beijin/mcs/banner/3e9d37e9effaa2b6daf43f3f03f7cb15cfcd208495d565ef66e7dff9f98764da.jpg',
  })
}

window.__q_notify = notification

// 动画
export function animate({
  duration,
  draw,
  timing,
  end,
  callId,
}: {
  duration: number
  draw: (progress: number) => void
  timing: (timeFraction: number) => number
  callId: (id: number) => void
  end?: () => void
}) {
  const start = performance.now()

  callId(
    requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration
      if (timeFraction > 1)
        timeFraction = 1

      const progress = timing(timeFraction)

      draw(progress)

      if (timeFraction < 1) {
        callId(requestAnimationFrame(animate))
      }
      else if (end) {
        end()
      }
    }),
  )
}
let delayLoadId: number | undefined

// 延迟
export async function delay(s: number) {
  loader({ ms: s * 1000 })
  return new Promise(resolve => setTimeout(resolve, s * 1000))
}

// 加载进度条
export function loader({ ms = 10000, color = '#54f98d', onDone = () => {} }) {
  let load = document.querySelector<HTMLDivElement>('#loader')
  if (!load) {
    const l = document.createElement('div')
    l.id = 'loader'
    document.querySelector('#header')?.appendChild(l)
    load = l
  }
  load.style.background = color
  if (delayLoadId != null) {
    cancelAnimationFrame(delayLoadId)
    delayLoadId = undefined
  }
  animate({
    duration: ms,
    callId(id) {
      delayLoadId = id
    },
    timing(timeFraction) {
      return timeFraction
    },
    draw(progress) {
      load.style.width = `${progress * 100}%`
    },
    end() {
      load.style.width = '0%'
      onDone()
    },
  })

  return () => {
    if (delayLoadId != null) {
      cancelAnimationFrame(delayLoadId)
      delayLoadId = undefined
    }
    const load = document.querySelector<HTMLDivElement>('#loader')
    if (load)
      load.style.width = '0%'
  }
}

// 获取当前日期
export function getCurDay(currentDate = new Date()) {
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取当前时间
export function getCurTime(currentDate = new Date()) {
  const hours = String(currentDate.getHours() + 1).padStart(2, '0')
  const minutes = String(currentDate.getMinutes() + 1).padStart(2, '0')
  const seconds = String(currentDate.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}
