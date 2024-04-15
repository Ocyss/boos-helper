
# 项目介绍

Boos直聘助手, 皆在减少投递简历的麻烦, 和提高投递简历的效率,技术栈使用VIte + Vue3 + element-plus, 代码由 Vite 打包无加密混淆最小化,开源在 Github 欢迎前来Pr

[1+.x.x] 为正式版本,同步github的release版本,不保证稳定性只是功能相对完善

[202x.x.x.alpha]/[0.x.x] 为测试版本,同步github的master分支,自动构建

> 24.04.11 后续会加上各个版本的更新内容，并且进行认真测试。最近在优化过程中，不慎将GPT内容发送给了老板而导致了严重的尴尬局面。以此为戒
> 24.04.15 为了项目简洁，以后版本更新将不会向下兼任，如果有配置文件的格式更改会提示，需要用户自己重新配置

## 项目预览

[![卡片状态](https://s21.ax1x.com/2024/04/14/pFvtxGF.png)](https://imgse.com/i/pFvtxGF)
[![账户配置](https://s21.ax1x.com/2024/04/14/pFvtvPU.png)](https://imgse.com/i/pFvtvPU)
[![统计界面](https://s21.ax1x.com/2024/04/02/pFHa3ZD.png)](https://imgse.com/i/pFHa3ZD)
[![配置界面](https://s21.ax1x.com/2024/04/02/pFHa8de.png)](https://imgse.com/i/pFHa8de)
[![日志界面](https://s21.ax1x.com/2024/04/02/pFHalqO.png)](https://imgse.com/i/pFHalqO)

### 问题解答/已知问题

- GPT给出非JSON格式的消息，导致报错
  - 花钱用GPT4，或者使用支持json的模型，等待下次更新
- 暗黑模式不完整啊，有些白的突然出来，要瞎掉了
  - 找boos反馈去，让他们适配暗黑，或者直接Pr，我技术菜手动适配太累了

## 未来计划

- [x] 优化UI去除广告
- [x] 批量投递简历
- 高级筛选
  - [x] 薪资,公司名,工作名,人数,内容简单筛选
  - [ ] 通勤时间
  - [ ] 公司风险评控
  - [x] GPT筛选
- 自动打招呼
  - [x] 模板语言
  - [x] 支持chatGPT,自定义http调用
- GPT赋能
  - [ ] 自动回复聊天
  - [x] 多模型管理
- 额外功能(有时间会写)
  - [x] 暗黑模式
  - [x] 自适应UI适配手机
  - [ ] 黑名单
  - [x] 多账号管理
  - [ ] 聊天屏蔽已读消息
  - [ ] boos消息弹窗

## 免责声明

本项目仅供学习交流，禁止用于商业用途

使用该脚本有一定风险(如黑号,封号,权重降低等)，本项目不承担任何责任

## 相关链接

Github开源地址: <https://github.com/ocyss/boos-helper>

greasyfork地址: <https://greasyfork.org/zh-CN/scripts/491340>

# 鸣谢

- <https://github.com/yangfeng20/boss_batch_push>
- <https://github.com/lisonge/vite-plugin-monkey>

- <https://www.runoob.com/manual/mqtt/protocol/MQTT-3.1.1-CN.pdf>

## Star 趋势

<a href="https://star-history.com/#ocyss/boos-helper&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ocyss/boos-helper&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ocyss/boos-helper&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ocyss/boos-helper&type=Date" />
 </picture>
</a>