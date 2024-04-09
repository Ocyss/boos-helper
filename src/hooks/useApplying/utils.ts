// 匹配范围
function rangeMatch(
  rangeStr: string,
  input?: string,
  by = 1
): [boolean, string] {
  if (!rangeStr) {
    return [false, "无内容"];
  }
  // 匹配定义范围的正则表达式
  const reg = /(\d+)(?:-(\d+))?/;
  const match = rangeStr.match(reg);
  let err = "预期之外";
  if (match && match.length > 0) {
    err = match[0];
  }
  if (match && input) {
    let start = parseInt(match[1]) * by;
    let end = parseInt(match[2] || match[1]) * by;

    // 如果输入只有一个数字的情况
    if (/^\d+$/.test(input)) {
      let number = parseInt(input);

      return [number >= start && number <= end, err];
    }

    // 如果输入有两个数字的情况
    let inputReg = /^(\d+)(?:-(\d+))?/;
    let inputMatch = input.match(inputReg);
    if (inputMatch) {
      let inputStart = parseInt(inputMatch[1]);
      let inputEnd = parseInt(inputMatch[2] || inputMatch[1]);
      return [
        (start >= inputStart && start <= inputEnd) ||
          (end >= inputStart && end <= inputEnd),
        err,
      ];
    }
  }

  // 其他情况均视为不匹配
  return [false, err];
}
