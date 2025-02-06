// 匹配范围
export function rangeMatch(
  rangeStr: string,
  input?: string,
  mode: 'intersection' | 'subset' = 'subset', // 交集、子集，默认: 子集
): [boolean, string] {
  if (!rangeStr) {
    return [false, '无内容']
  }
  // 匹配定义范围的正则表达式
  const reg = /(\d+)(?:-(\d+))?/
  const match = rangeStr.match(reg)
  let err = '预期之外'
  if (match && match.length > 0) {
    err = match[0]
  }
  if (match && input) {
    const start = Number.parseInt(match[1])
    const end = Number.parseInt(match[2] || match[1])

    // 如果输入只有一个数字的情况
    if (/^\d+$/.test(input)) {
      const number = Number.parseInt(input)

      return [number >= start && number <= end, err]
    }

    // 如果输入有两个数字的情况
    const inputReg = /^(\d+)(?:-(\d+))?/
    const inputMatch = input.match(inputReg)
    if (inputMatch) {
      const inputStart = Number.parseInt(inputMatch[1])
      const inputEnd = Number.parseInt(inputMatch[2] || inputMatch[1])
      return [
        // start-end: 15-29 用户输入: inputStart-inputEnd 16-20
        mode === 'subset'
          ? (start >= inputStart && start <= inputEnd) || (end >= inputStart && end <= inputEnd) // 子集
          : !(end < inputStart || inputEnd < start), // 交集
        err,
      ]
    }
  }

  // 其他情况均视为不匹配
  return [false, err]
}
