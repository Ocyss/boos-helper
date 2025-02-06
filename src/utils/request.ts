import { loader } from ".";
import { events } from "fetch-event-stream";

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

export type OnStream = (reader: ReturnType<typeof events>) => Promise<void>;

type GmXhrRequest<TContext, TResponseType extends ResponseType> = {
  method?: string;
  url: string;
  headers?: Record<string, string>;

  data?:
    | string
    | URLSearchParams
    | FormData
    | ArrayBuffer
    | Blob
    | DataView
    | ReadableStream;

  /**
   * @available tampermonkey
   */
  redirect?: `follow` | `error` | `manual`;

  /**
   * @available tampermonkey
   */
  cookie?: string;

  binary?: boolean;

  /**
   * @available tampermonkey
   */
  nocache?: boolean;

  /**
   * @available tampermonkey
   */
  revalidate?: boolean;

  timeout?: number;

  /**
   * Property which will be added to the response event object
   */
  context?: TContext;

  /**
   * @tampermonkey  text, json, arraybuffer, blob, document, stream
   * @violentmonkey text, json, arraybuffer, blob, document
   * @default
   * 'text'
   */
  responseType?: TResponseType;

  overrideMimeType?: string;

  anonymous?: boolean;

  /**
   * @available tampermonkey
   */
  fetch?: boolean;

  user?: string;

  password?: string;

  onabort?: () => void;

  onerror?: any;

  /**
   * @available violentmonkey
   */
  onloadend?: any;

  onloadstart?: any;

  onprogress?: any;

  onreadystatechange?: any;

  ontimeout?: () => void;

  onload?: any;
};


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
  onStream = async () => {},
  isFetch = false,
}: RequestArgs<TContext, TResponseType>) {

  const abortController = new AbortController();

  return new Promise((resolve, reject) => {
    // Start loading indication
    axiosLoad = loader({ ms: timeout * 1000, color: "#F79E63" });
    fetch(url, {
      method,
      headers,
      body: data,
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.body) {
          reject(new RequestError("没有响应体"));
          return;
        }
        if (!response.ok) {
          const errorText = await response.text();
          if (axiosLoad) axiosLoad();
          reject(new RequestError(`${errorText} | ${response.statusText}`));
          return;
        }
        if (responseType === "stream") {
          // const reader = response.body.getReader();
          const stream = events(response, abortController.signal);
          await onStream(stream);
          return;
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
