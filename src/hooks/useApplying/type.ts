import type { logData } from '../useLog'

export interface handleArgs {
  data: JobListData
}

export type handleFn = (args: handleArgs, ctx: logData) => Promise<void>
export type handleCFn = (handles: handleFn[]) => void
