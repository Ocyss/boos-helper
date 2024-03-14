import { Ctx } from "./context";

export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
}

export type log = {
  level: LogLevel;
  args: any[];
};

export const Loggers: Record<string, Logger> = {};

export class Logger {
  logs: log[];
  oldLogs: Record<string, { msg: string; logs: log[] }>;
  print: boolean;
  level: LogLevel;
  constructor(options?: { name?: string; level?: LogLevel; print?: boolean }) {
    Loggers[options?.name ?? "default"] = this;
    this.logs = [];
    this.oldLogs = {};
    this.print = options?.print ?? false;
    this.level = options?.level ?? LogLevel.INFO;
  }
  log(level: LogLevel, ...args: any[]) {
    this.logs.push({ level, args });
    if (this.print && level >= this.level) {
      switch (level) {
        case LogLevel.DEBUG:
          console.log("%cBoosHelper-DEBUG:", "color: blue", ...args);
          break;
        case LogLevel.INFO:
          console.log("%cBoosHelper-INFO:", "color: green", ...args);
          break;
        case LogLevel.WARNING:
          console.log("%cBoosHelper-WARNING:", "color: orange", ...args);
          break;
        case LogLevel.ERROR:
          console.log("%cBoosHelper-ERROR:", "color: red", ...args);
          break;
        default:
          console.log(...args);
          break;
      }
    }
  }
  slice(msg?: string) {
    if (this.logs.length == 0) return;
    const d = new Date().toLocaleString();
    this.oldLogs[d] = { msg: msg ?? d, logs: this.logs };
    this.logs = [];
  }
  ctx(title: string) {
    return new Ctx(title, (...args: any[]) => {
      this.info(...args);
    });
  }
  debug(...args: any[]) {
    this.log(LogLevel.DEBUG, ...args);
  }
  info(...args: any[]) {
    this.log(LogLevel.INFO, ...args);
  }
  warn(...args: any[]) {
    this.log(LogLevel.WARNING, ...args);
  }
  error(...args: any[]) {
    this.log(LogLevel.ERROR, ...args);
  }
}

export const logger = new Logger(
  process.env.NODE_ENV === "production"
    ? undefined
    : { level: LogLevel.DEBUG, print: true }
);
