// 深度合并
// https://github.com/sindresorhus/is-plain-obj/blob/main/index.js
export function isPlainObject(
  item: unknown,
): item is Record<keyof any, unknown> {
  if (typeof item !== 'object' || item === null) {
    return false
  }

  // eslint-disable-next-line ts/no-unsafe-assignment
  const prototype = Object.getPrototypeOf(item)
  return (
    (prototype === null
      || prototype === Object.prototype
      || Object.getPrototypeOf(prototype) === null)
    && !(Symbol.toStringTag in item)
    && !(Symbol.iterator in item)
  )
}

export interface DeepmergeOptions {
  clone?: boolean
}

function deepClone<T>(source: T): T | Record<keyof any, unknown> {
  if (!isPlainObject(source)) {
    return source
  }

  const output: Record<keyof any, unknown> = {}

  Object.keys(source).forEach((key) => {
    output[key] = deepClone(source[key])
  })

  return output
}

export default function deepmerge<T>(
  target: T,
  source: unknown,
  options: DeepmergeOptions = { clone: true },
): T {
  const output = options.clone ? { ...target } : target

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      // Avoid prototype pollution
      if (key === '__proto__') {
        return
      }

      if (
        isPlainObject(source[key])
        && key in target
        && isPlainObject(target[key])
      ) {
        // Since `output` is a clone of `target` and we have narrowed `target` in this block we can cast to the same type.
        (output as Record<keyof any, unknown>)[key] = deepmerge(
          target[key],
          source[key],
          options,
        )
      }
      else if (options.clone) {
        (output as Record<keyof any, unknown>)[key] = isPlainObject(source[key])
          ? deepClone(source[key])
          : source[key]
      }
      else {
        (output as Record<keyof any, unknown>)[key] = source[key]
      }
    })
  }

  return output
}

export function jsonClone<T>(source: T): T {
  return JSON.parse(JSON.stringify(source)) as T
}
