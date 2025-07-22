// https://bbs.tampermonkey.net.cn/forum.php?mod=redirect&goto=findpost&ptid=5899&pid=77134
const icons = { debug: '🐞', info: 'ℹ️', warn: '⚠', error: '❌️' }
const Color = {
  debug: '#42CA8C;',
  info: '#37C5D6;',
  warn: '#EFC441;',
  error: '#FF6257;',
}

function getCleanConsole() {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.head.appendChild(iframe)
  const cleanConsole = iframe.contentWindow!.console as Console
  // document.head.removeChild(iframe)
  return cleanConsole
}

const newConsole = getCleanConsole()

export const logger = {
  log: newConsole.log.bind(
    newConsole,
    `%c${icons.info} log > `,
    `color:${Color.info}; padding-left:1.2em; line-height:1.5em;`,
  ),
  debug: newConsole.log.bind(
    newConsole,
    `%c${icons.debug} debug > `,
    `color:${Color.debug}; padding-left:1.2em; line-height:1.5em;`,
  ),
  info: newConsole.info.bind(
    newConsole,
    `%c${icons.info} info > `,
    `color:${Color.info}; padding-left:1.2em; line-height:1.5em;`,
  ),
  warn: newConsole.warn.bind(
    newConsole,
    `%c${icons.warn} warn > `,
    `color:${Color.warn}; padding-left:1.2em; line-height:1.5em;`,
  ),
  error: newConsole.error.bind(
    newConsole,
    `%c${icons.error} error > `,
    `color:${Color.error}; padding-left:1.2em; line-height:1.5em;`,
  ),
  group: newConsole.groupCollapsed,
  groupEnd: newConsole.groupEnd,
}
