import { GM_notification } from "$";

// 通知
export function notification(content: string) {
  GM_notification({
    title: "Boss直聘批量投简历",
    image:
      "https://img.bosszhipin.com/beijin/mcs/banner/3e9d37e9effaa2b6daf43f3f03f7cb15cfcd208495d565ef66e7dff9f98764da.jpg",
    text: content,
    highlight: true, // 布尔值，是否突出显示发送通知的选项卡
    silent: true, // 布尔值，是否播放声音
    timeout: 10000, // 设置通知隐藏时间
    onclick: function () {
      console.log("点击了通知");
    },
    ondone() {}, // 在通知关闭（无论这是由超时还是单击触发）或突出显示选项卡时调用
  });
}

// 动画
export function animate({
  duration,
  draw,
  timing,
  end,
  callId,
}: {
  duration: number;
  draw: (progress: number) => void;
  timing: (timeFraction: number) => number;
  callId: (id: number) => void;
  end?: () => void;
}) {
  let start = performance.now();

  callId(
    requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      let progress = timing(timeFraction);

      draw(progress);

      if (timeFraction < 1) {
        callId(requestAnimationFrame(animate));
      } else if (end) {
        end();
      }
    })
  );
}
let delayLoadId: number | undefined = undefined;
// 延迟
export function delay(ms: number) {
  let load = document.querySelector<HTMLDivElement>("#loader");
  if (!load) {
    const l = document.createElement("div");
    l.id = "loader";
    document.querySelector("#header")?.appendChild(l);
    load = l;
  }
  if (delayLoadId) {
    cancelAnimationFrame(delayLoadId);
    delayLoadId = undefined;
  }
  animate({
    duration: ms,
    callId(id) {
      delayLoadId = id;
    },
    timing(timeFraction) {
      return timeFraction;
    },
    draw(progress) {
      load.style.width = progress * 100 + "%";
    },
    end() {
      load.style.width = "0%";
    },
  });
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 获取当前日期
export function getCurDay() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
