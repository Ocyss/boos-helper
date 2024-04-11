import { logData } from "../useLog";

export type handleArgs = {
  data: JobListData;
};

export type handleFn = (args: handleArgs, ctx: logData) => Promise<void>;
export type handleCFn = (handles: handleFn[]) => void;
