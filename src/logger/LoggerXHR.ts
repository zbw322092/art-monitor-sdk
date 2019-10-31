import LoggerBase from './LoggerBase';

const handleXHRResponse = (xhr: XMLHttpRequest): string => {
  let response: string;
  switch (xhr.responseType) {
    case '':
    case 'text':
      response = xhr.response;
      break;
    case 'json':
      response = JSON.stringify(xhr.response);
      break;
    default:
      response = Object.prototype.toString.call(xhr.response);
      break;
  }
  return response;
};

export class LoggerXHR extends LoggerBase {
  constructor(TrackType: number, xhr: XMLHttpRequest) {
    super(TrackType);

    this.responseURL = xhr.responseURL;
    this.status = xhr.status;
    this.statusText = xhr.statusText;
    this.responseType = xhr.responseType;
    this.response = handleXHRResponse(xhr);
    this.readyState = xhr.readyState;
    this.timeout = xhr.timeout;
  }

  public responseURL: string | null;
  public status: number;
  public statusText: string;
  public responseType: string;
  public response: string;
  public readyState: number;
  public timeout: number;
}