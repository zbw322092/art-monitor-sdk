const COMPLETED_READY_STATE = 4;

const NativeXHRSend = XMLHttpRequest.prototype.send;

type IXHRCallback = (xhr: XMLHttpRequest) => any;

const requestCallbacks: IXHRCallback[] = [];
const responseCallbacks: IXHRCallback[] = [];

let wired = false;

const arrayRemove = (array: any[], item: any) => {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  } else {
    throw new Error('Could not remove ' + item + ' from array');
  }
};

const fireCallbacks = (callbacks: IXHRCallback[], xhr: XMLHttpRequest): void => {
  for (let i = 0, len = callbacks.length; i < len; i++) {
    callbacks[i](xhr);
  }
};

const fireResponseCallbacksIfCompleted = (xhr: XMLHttpRequest): void => {
  if (xhr.readyState === COMPLETED_READY_STATE) {
    fireCallbacks(responseCallbacks, xhr);
  }
};

const proxifyOnReadyStateChange = (xhr: XMLHttpRequest) => {
  const realOnReadyStateChange = xhr.onreadystatechange as any;
  if (realOnReadyStateChange) {
    xhr.onreadystatechange = function () {
      fireResponseCallbacksIfCompleted(xhr);
      realOnReadyStateChange();
    };
  }
};

export const xhrInterceptor = {
  addRequestCallback: (callback: IXHRCallback): void => {
    requestCallbacks.push(callback);
  },

  removeRequestCallback: (callback: IXHRCallback): void => {
    arrayRemove(requestCallbacks, callback);
  },

  addResponseCallback: (callback: IXHRCallback): void => {
    responseCallbacks.push(callback);
  },

  removeResponseCallback: (callback: IXHRCallback): void => {
    arrayRemove(responseCallbacks, callback);
  },

  isWired: () => {
    return wired;
  },

  wire: () => {
    // XHR interceptor already wired
    if (wired) { return; }

    // Override send method of all XHR requests
    XMLHttpRequest.prototype.send = function () {
      // Fire request callbacks before sending the request
      fireCallbacks(requestCallbacks, this);

      // Wire response callbacks
      if (this.addEventListener) {
        const self = this;
        this.addEventListener('readystatechange', function () {
          fireResponseCallbacksIfCompleted(self);
        }, false);
      } else {
        proxifyOnReadyStateChange(this);
      }

      NativeXHRSend.apply(this, arguments as any);
    };

    wired = true;
  },

  unwire: () => {
    // XHR interceptor not currently wired
    if (!wired) { return; }
    XMLHttpRequest.prototype.send = NativeXHRSend;
    wired = false;
  }
};
