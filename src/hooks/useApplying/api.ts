import { GreetError, PublishError } from "@/types/deliverError";
import axios from "axios";
import { useStore } from "../useStore";
import { ElMessage } from "element-plus";
import { unsafeWindow } from "$";

const { userInfo } = useStore();
export function requestCard(params: { securityId: string; lid: string }) {
  return axios.get<{
    code: number;
    message: string;
    zpData: {
      jobCard: JobCard;
    };
  }>("https://www.zhipin.com/wapi/zpgeek/job/card.json", {
    params,
    timeout: 5000,
  });
}

export async function sendPublishReq(
  data: JobListData,
  errorMsg?: string,
  retries = 3
) {
  if (retries === 0) {
    throw new PublishError(errorMsg || "重试多次失败");
  }
  const url = "https://www.zhipin.com/wapi/zpgeek/friend/add.json";
  let params: {
    securityId: string | null;
    jobId: string | null;
    lid: string | null;
  };
  params = {
    securityId: data.securityId,
    jobId: data.encryptJobId,
    lid: data.lid,
  };
  const token = unsafeWindow?.Cookie.get("bst");
  if (!token) {
    ElMessage.error("没有获取到token,请刷新重试");
    throw new PublishError("没有获取到token");
  }
  try {
    const res = await axios({
      url,
      params,
      method: "POST",
      headers: { Zp_token: token },
    });
    if (
      res.data.code === 1 &&
      res.data?.zpData?.bizData?.chatRemindDialog?.content
    ) {
      throw new PublishError(
        res.data?.zpData?.bizData?.chatRemindDialog?.content
      );
    }
    if (res.data.code !== 0) {
      throw new PublishError("状态错误:" + res.data.message);
    }
    return res.data;
  } catch (e: any) {
    if (e instanceof PublishError) {
      throw e;
    }
    return sendPublishReq(data, e.message, retries - 1);
  }
}

export async function requestBossData(
  card: JobCard,
  errorMsg?: string,
  retries = 3
): Promise<BoosData> {
  if (retries === 0) {
    throw new GreetError(errorMsg || "重试多次失败");
  }
  const url = "https://www.zhipin.com/wapi/zpchat/geek/getBossData";
  // userInfo.value?.token 不相等！
  const token = unsafeWindow?.Cookie.get("bst");
  if (!token) {
    ElMessage.error("没有获取到token,请刷新重试");
    throw new GreetError("没有获取到token");
  }
  try {
    const data = new FormData();
    data.append("bossId", card.encryptUserId);
    data.append("securityId", card.securityId);
    data.append("bossSrc", "0");
    const res = await axios<{
      code: number;
      message: string;
      zpData: BoosData;
    }>({
      url,
      data: data,
      method: "POST",
      headers: { Zp_token: token },
    });
    if (res.data.code !== 0 && res.data.message !== "非好友关系") {
      throw new GreetError("状态错误:" + res.data.message);
    }
    if (res.data.code !== 0)
      return requestBossData(card, "非好友关系", retries - 1);
    return res.data.zpData;
  } catch (e: any) {
    if (e instanceof GreetError) {
      throw e;
    }
    return requestBossData(card, e.message, retries - 1);
  }
}
