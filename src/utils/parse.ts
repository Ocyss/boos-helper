import { ARR, NULL, NUM, OBJ, parse, STR } from 'partial-json'

export function parseGptJson<T = any>(json: string): Partial<T> | null {
  return parse(
    json.replace(/^```json|```$/g, ''),
    STR | OBJ | NUM | ARR | NULL,
  )
}

window.parseGptJson = parseGptJson
