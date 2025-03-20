import { ALL, parse } from 'partial-json'

export function parseGptJson<T = any>(json: string): Partial<T> | null {
  const match = json.match(/```json(.+?)```/s)
  if (match) {
    json = match[1]
  }
  return parse(
    json,
    ALL,
  )
}

window.__q_parseGptJson = parseGptJson
