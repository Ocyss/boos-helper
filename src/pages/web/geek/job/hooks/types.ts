export const errMap = new Map<string, boolean>();

function createCustomError(name: string) {
  errMap.set(name, true);
  return class CustomError extends Error {
    static message: any;
    constructor(
      message: string
      // cause?: any
      // options?: ErrorOptions
    ) {
      super(message);
      this.name = name;
      Object.setPrototypeOf(this, CustomError.prototype);
    }
  };
}

export const JobTitleError = createCustomError("岗位名筛选");
export const CompanyNameError = createCustomError("公司名筛选");
export const SalaryError = createCustomError("薪资筛选");
export const CompanySizeError = createCustomError("公司规模筛选");
export const JobDescriptionError = createCustomError("工作内容筛选");
export const UnknownError = createCustomError("未知错误");
export const PublishError = createCustomError("投递出错");
