import { GM_getValue, GM_setValue } from "$";
import { logger } from "@/utils/logger";
import { filterKey } from "./type";

export class ScriptConfig {
  static LOCAL_CONFIG = "config";
  static PUSH_COUNT = `pushCount:${ScriptConfig.getCurDay()}`;
  static PUSH_LIMIT = `push_limit${ScriptConfig.getCurDay()}`;
  static PUSH_LOCK = "push_lock";
  static PUSH_MESSAGE = "push_message";
  static ACTIVE_ENABLE = "activeEnable";
  static SEND_SELF_GREET_ENABLE = "sendSelfGreetEnable";
  static SEND_SELF_GREET_MEMORY = "sendSelfGreetMemory";
  configObj: Record<string, any> = {};

  constructor() {
    this.loaderConfig();
  }

  static getCurDay() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  static pushCountIncr() {
    let number = GM_getValue(ScriptConfig.PUSH_COUNT, 0);
    GM_setValue(ScriptConfig.PUSH_COUNT, ++number);
  }

  getConfig(key: string): string {
    let value = this.configObj[key];
    if (Array.isArray(value)) {
      return value.join(",");
    }
    return String(value ?? "");
  }

  getArrConfig(key: string): string[] {
    let value = this.configObj[key];
    if (Array.isArray(value)) {
      return value;
    }
    return [value ?? ""];
  }
  setCompanyNameInclude(val: string) {
    return (this.configObj[filterKey.cnInKey] = val.split(","));
  }

  setCompanyNameExclude(val: string) {
    this.configObj[filterKey.cnExKey] = val.split(",");
  }

  setJobNameInclude(val: string) {
    this.configObj[filterKey.jnInKey] = val.split(",");
  }

  setJobContentExclude(val: string) {
    this.configObj[filterKey.jcExKey] = val.split(",");
  }

  setSalaryRange(val: string) {
    this.configObj[filterKey.srInKey] = val;
  }

  setCompanyScaleRange(val: string) {
    this.configObj[filterKey.csrInKey] = val;
  }

  setSelfGreet(val: string) {
    this.configObj[filterKey.sgInKey] = val;
  }
  static setSelfGreetMemory(val: string) {
    GM_setValue(ScriptConfig.SEND_SELF_GREET_MEMORY, val);
  }

  getSelfGreetMemory() {
    return GM_getValue(
      ScriptConfig.SEND_SELF_GREET_MEMORY,
      this.getConfig(filterKey.sgInKey)
    );
  }

  storeConfig() {
    GM_setValue(ScriptConfig.LOCAL_CONFIG, JSON.stringify(this.configObj));
    logger.info("存储配置到本地存储", JSON.stringify(this.configObj));
  }

  loaderConfig() {
    let localConfig = GM_getValue(ScriptConfig.LOCAL_CONFIG, "");
    if (!localConfig) {
      logger.warn("未加载到本地配置");
      return;
    }
    this.configObj = JSON.parse(localConfig);
    logger.info("成功加载本地配置", this.configObj);
  }
}
