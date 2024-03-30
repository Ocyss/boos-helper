export const errMap = new Map<string, boolean>();
function createCustomError(
  name: string,
  state = "warning" as "warning" | "danger"
) {
  errMap.set(name, true);
  return class CustomError extends Error {
    static message: any;
    state: "warning" | "danger";
    constructor(
      message: string
      // cause?: any
      // options?: ErrorOptions
    ) {
      super(message);
      this.name = name;
      this.state = state;
      Object.setPrototypeOf(this, CustomError.prototype);
    }
  };
}
export const RepeatError = createCustomError("重复沟通");
export type RepeatError = InstanceType<typeof RepeatError>;
export const JobTitleError = createCustomError("岗位名筛选");
export type JobTitleError = InstanceType<typeof JobTitleError>;
export const CompanyNameError = createCustomError("公司名筛选");
export type CompanyNameError = InstanceType<typeof CompanyNameError>;
export const SalaryError = createCustomError("薪资筛选");
export type SalaryError = InstanceType<typeof SalaryError>;
export const CompanySizeError = createCustomError("公司规模筛选");
export type CompanySizeError = InstanceType<typeof CompanySizeError>;
export const JobDescriptionError = createCustomError("工作内容筛选");
export type JobDescriptionError = InstanceType<typeof JobDescriptionError>;
export const ActivityError = createCustomError("活跃度过滤");
export type ActivityError = InstanceType<typeof ActivityError>;
export const UnknownError = createCustomError("未知错误", "danger");
export type UnknownError = InstanceType<typeof UnknownError>;
export const PublishError = createCustomError("投递出错", "danger");
export type PublishError = InstanceType<typeof PublishError>;
export const GreetError = createCustomError("打招呼出错", "danger");
export type GreetError = InstanceType<typeof GreetError>;
