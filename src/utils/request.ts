import { GM_xmlhttpRequest, GmXhrRequest } from "$";
import { loader } from ".";

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "请求错误";
  }
}
export type ResponseType =
  | "text"
  | "json"
  | "arraybuffer"
  | "blob"
  | "document"
  | "stream";
export type OnStream = (
  reader: ReadableStreamDefaultReader<Uint8Array>
) => void;
export type RequestArgs<TContext, TResponseType extends ResponseType> = Partial<
  Pick<
    GmXhrRequest<TContext, TResponseType>,
    "method" | "url" | "data" | "headers" | "timeout" | "responseType"
  > & {
    onStream: OnStream;
    isFetch: boolean;
  }
>;
let axiosLoad: () => void;

export function request<TContext, TResponseType extends ResponseType = "json">({
  method = "POST",
  url = "",
  data = "",
  headers = {},
  timeout = 5,
  responseType = "json" as TResponseType,
  onStream = () => {},
  isFetch = false,
}: RequestArgs<TContext, TResponseType>) {
  if (!isFetch)
    return new Promise<TContext>((resolve, reject) => {
      GM_xmlhttpRequest<TContext, TResponseType>({
        method,
        url,
        data,
        headers,
        timeout: timeout * 1000,
        responseType,

        ontimeout() {
          if (axiosLoad) axiosLoad();
          reject(new RequestError(`超时 ${Math.round(timeout / 1000)}s`));
        },
        onabort() {
          if (axiosLoad) axiosLoad();
          reject(new RequestError("用户中止"));
        },
        onerror(e) {
          const msg = `${e.responseText} | ${e.error}`;
          if (axiosLoad) axiosLoad();
          reject(new RequestError(msg));
        },
        // onloadend(e) {
        //   if (axiosLoad) axiosLoad();
        //   resolve(e.response);
        // },
        onload(e) {
          if (axiosLoad) axiosLoad();
          resolve(e.response);
        },
        onloadstart(e) {
          axiosLoad = loader({ ms: timeout * 1000, color: "#F79E63" });
          if (responseType === "stream") {
            const reader = (
              e.response as ReadableStream<Uint8Array>
            ).getReader();
            onStream(reader);
          }
        },
      });
    });
  else {
    const abortController = new AbortController();
    const signal = abortController.signal;

    return new Promise((resolve, reject) => {
      // Start loading indication
      axiosLoad = loader({ ms: timeout * 1000, color: "#F79E63" });
      fetch(url, {
        method,
        headers,
        body: data,
        signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            if (axiosLoad) axiosLoad();
            reject(new RequestError(`${errorText} | ${response.statusText}`));
            return;
          }
          if (responseType === "stream") {
            const reader = response.body?.getReader();
            if (reader) onStream(reader);
          } else {
            const result =
              responseType === "json"
                ? await response.json()
                : await response.text();
            if (axiosLoad) axiosLoad();
            resolve(result);
          }
        })
        .catch((e) => {
          if (axiosLoad) axiosLoad();
          if (e.name === "AbortError") {
            reject(new RequestError("用户中止"));
          } else {
            const msg = `${e.message}`;
            reject(new RequestError(msg));
          }
        });

      // Set timeout
      setTimeout(() => {
        abortController.abort();
        if (axiosLoad) axiosLoad();
        reject(new RequestError(`超时 ${Math.round(timeout / 1000)}s`));
      }, timeout * 1000);
    });
  }
}

request.post = <TContext, TResponseType extends ResponseType = "json">(
  args: Omit<RequestArgs<TContext, TResponseType>, "method">
) => {
  return request<TContext, TResponseType>({
    method: "POST",
    ...args,
  });
};

request.get = <TContext, TResponseType extends ResponseType = "json">(
  args: Omit<RequestArgs<TContext, TResponseType>, "method">
) => {
  return request<TContext, TResponseType>({
    method: "GET",
    ...args,
  });
};
