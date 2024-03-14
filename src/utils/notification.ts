import { GM_notification } from "$";

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
