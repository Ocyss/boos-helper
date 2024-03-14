export class Ctx {
  private title: string;
  private logs: any[];
  private logfunc: (...args: any[]) => void;
  constructor(title: string, logfunc: (...args: any[]) => void) {
    this.title = title;
    this.logs = [];
    this.logfunc = logfunc;
  }
  add(...args: any[]) {
    this.logs.push(...args);
  }
  log() {
    this.logfunc(this.title, ...this.logs);
  }
}
