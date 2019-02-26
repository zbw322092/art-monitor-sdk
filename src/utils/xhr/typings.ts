export interface XhrBaseConfig {
  useXDR?: boolean;
  sync?: boolean;
  method?: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT';
  timeout?: number;
  headers?: XhrHeaders;
  body?: string | any;
  json?: boolean;
  username?: string;
  password?: string;
  withCredentials?: boolean;
  responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  beforeSend?: (xhrObject: XMLHttpRequest) => void;
  xhr?: XMLHttpRequest;
}

export interface XhrUrlConfig extends XhrBaseConfig {
  url?: string;
}

export type XhrCallback = (
  error: Error,
  response: XhrResponse,
  body: any
) => void;

export interface XhrResponse {
  body: Object | string;
  statusCode: number;
  method: string;
  headers: XhrHeaders;
  url: string;
  rawRequest: XMLHttpRequest;
}

export interface XhrHeaders {
  [key: string]: string;
}