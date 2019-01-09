// import { Cursor } from './Cursor';

interface IPromiseWithReq<T> extends Promise<T> {
  request?: IDBRequest | IDBOpenDBRequest;
}

export const promisifyRequest = (request: IDBRequest | IDBOpenDBRequest): Promise<any> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const promisifyRequestCall = (
  obj: object,
  method: string,
  args: string[] | ArrayLike<any>
): IPromiseWithReq<any> => {

  let request;
  const promiseCall = new Promise((resolve, reject) => {
    request = obj[method].apply(obj, args);
    if (request) {
      promisifyRequest(request).then(resolve, reject);
    }
  }) as IPromiseWithReq<any>;

  promiseCall.request = request;

  return promiseCall;
};

export const promisifyCursorRequestCall = (
  obj: object,
  method: string,
  args: string[] | ArrayLike<any>,
  Cursor
): Promise<any> => {
  const promiseCall = promisifyRequestCall(obj, method, args);
  return promiseCall.then((value) => {
    if (!value) { return; }
    return new Cursor(value, promiseCall.request);
  });
};