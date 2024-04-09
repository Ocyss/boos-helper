import { logData } from "../useLog";

export type handleArgs = {
  data: JobListData;
  card?: JobCard;
};

export type handleFn = (args: handleArgs, ctx: logData) => Promise<void>;
export type handleCFn = (handles: handleFn[]) => void;
