// https://bbs.tampermonkey.net.cn/forum.php?mod=redirect&goto=findpost&ptid=5899&pid=77134
const icons = { debug: '🐞', info: 'ℹ️', warn: '⚠', error: '❌️' }
const Color = {
  debug: '#42CA8C;',
  info: '#37C5D6;',
  warn: '#EFC441;',
  error: '#FF6257;',
}
export const logger = {
  debug: console.log.bind(
    console,
    `%c${icons.debug} debug > `,
    `color:${Color.debug}; padding-left:1.2em; line-height:1.5em;`,
  ),
  info: console.info.bind(
    console,
    `%c${icons.info} info > `,
    `color:${Color.info}; padding-left:1.2em; line-height:1.5em;`,
  ),
  warn: console.warn.bind(
    console,
    `%c${icons.warn} warn > `,
    `color:${Color.warn}; padding-left:1.2em; line-height:1.5em;`,
  ),
  error: console.error.bind(
    console,
    `%c${icons.error} error > `,
    `color:${Color.error}; padding-left:1.2em; line-height:1.5em;`,
  ),
  group: console.groupCollapsed,
  groupEnd: console.groupEnd,
}
