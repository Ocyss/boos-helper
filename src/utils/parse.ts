import { unsafeWindow } from "$";
import { parse, STR, OBJ, NUM, ARR, NULL } from "partial-json";

export function parseGptJson<T = any>(json: string): Partial<T> | null {
  return parse(
    json.replace(/^```json|```$/g, ""),
    STR | OBJ | NUM | ARR | NULL
  );
}

unsafeWindow.parseGptJson = parseGptJson;
