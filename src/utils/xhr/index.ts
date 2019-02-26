import { XhrUrlConfig, XhrCallback, XhrResponse } from './typings';
import { HttpMethod } from '../../enums/HttpMethod';
import { ReadyState } from '../../enums/ReadyState';

export function XHR(url: string, options: XhrUrlConfig, callback: XhrCallback) {

  let xhr = options.xhr || null;
  const nativeXMLHttpRequest = XMLHttpRequest || noop;
  const nativeXDomainRequest = 'withCredentials' in (new nativeXMLHttpRequest()) ?
    XMLHttpRequest : (window as any).XDomainRequest;
  const { headers = {}, method = HttpMethod.GET, username, password, withCredentials,
    timeout, responseType, beforeSend, useXDR, json } = options;
  let body = options.body;
  const sync = !!options.sync;
  let aborted = false;
  let timeoutTimer;
  const failureResponse = {
    body: {},
    headers: {},
    statusCode: 0,
    method,
    url,
    rawRequest: xhr as XMLHttpRequest
  };

  if (xhr === null) {
    if (useXDR) {
      xhr = new nativeXDomainRequest() as XMLHttpRequest;
    } else {
      xhr = new nativeXMLHttpRequest() as XMLHttpRequest;
    }
  }

  if (json === true) {
    if (headers.accept || headers.Accept) {
      headers.Accept = 'application/json';
    }
    if (method !== HttpMethod.GET && method !== HttpMethod.HEAD) {
      if (headers['content-type'] || headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      body = JSON.stringify(body);
    }
  }

  let called = false;
  const callbackOnce = function (err: Error, response: XhrResponse, cbBody: any) {
    if (!called) {
      called = true;
      callback(err, response, cbBody);
    }
  };

  function getBody() {
    // Chrome with requestType=blob throws errors arround when even testing access to responseText
    let responseBody;

    if ((xhr as XMLHttpRequest).response) {
      responseBody = (xhr as XMLHttpRequest).response;
    } else {
      responseBody = (xhr as XMLHttpRequest).responseText || getXml(xhr as XMLHttpRequest);
    }

    if (json) {
      try {
        responseBody = JSON.parse(responseBody);
      } catch (err) { console.log('JSON parse error: ', err); }
    }

    return responseBody;
  }

  function onLoad() {
    if (aborted) { return; }
    let status;
    let response = failureResponse;
    let err;
    clearTimeout(timeoutTimer);
    if (useXDR && (xhr as XMLHttpRequest).status === undefined) {
      // IE8 CORS GET successful response doesn't have a status field, but body is fine
      status = 200;
    } else {
      status = (xhr as XMLHttpRequest).status === 1223 ? 204 : (xhr as XMLHttpRequest).status;
    }

    if (status !== 0) {
      response = {
        body: getBody(),
        statusCode: status,
        method,
        headers: {},
        url,
        rawRequest: xhr as XMLHttpRequest
      };

      if ((xhr as XMLHttpRequest).getAllResponseHeaders) {
        // xhr can in fact be XDR for CORS in IE
        response.headers = parseHeaders((xhr as XMLHttpRequest).getAllResponseHeaders());
      }
    } else {
      err = new Error('Internal XMLHttpRequest Error');
    }

    return callbackOnce(err, response, response.body);
  }

  function onError(err) {
    clearTimeout(timeoutTimer);
    if (!(err instanceof Error)) {
      err = new Error('' + (err || 'Unknown XMLHttpRequest Error') );
    }
    err.statusCode = 0;
    return callbackOnce(err, failureResponse, failureResponse.body);
  }

  xhr.onreadystatechange = () => {
    if ((xhr as XMLHttpRequest).readyState === ReadyState.DONE) {
      setTimeout(onLoad, 0);
    }
  };
  xhr.onload = onLoad;
  xhr.onerror = onError;
  // IE9 must have onprogress be set to a unique function.
  // tslint:disable-next-line:no-empty
  xhr.onprogress = () => { };
  xhr.onabort = () => {
    aborted = true;
  };
  xhr.ontimeout = onError;
  xhr.open(method, url, !sync, username, password);
  if (!sync) {
    xhr.withCredentials = !!withCredentials;
  }

  // Cannot set timeout with sync request
  // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
  // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
  if (!sync && timeout && timeout > 0) {
    timeoutTimer = setTimeout(() => {
      if (aborted) { return; }
      aborted = true; // IE9 may still call readystatechange
      (xhr as XMLHttpRequest).abort();
      const err = new Error('XMLHttpRequest timeout');
      (err as any).code = 'ETIMEDOUT';
      onError(err);
    }, timeout);
  }

  if (xhr.setRequestHeader) {
    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, headers[key]);
      }
    }
  } else if (headers && isEmpty(headers)) {
    throw new Error('Headers cannot be set on an XDomainRequest object');
  }

  if (responseType) {
    xhr.responseType = responseType;
  }

  if (beforeSend && typeof options.beforeSend === 'function') {
    beforeSend(xhr);
  }

  // Microsoft Edge browser sends "undefined" when send is called with undefined value.
  // XMLHttpRequest spec says to pass null as body to indicate no body
  // See https://github.com/naugtur/xhr/issues/100.
  xhr.send(body || null);

  return xhr;
}

// tslint:disable-next-line:no-empty
function noop() { }

function isEmpty(obj: object) {
  for (const index in obj) {
    if (obj.hasOwnProperty(index)) { return false; }
  }
  return true;
}

function getXml(xhr: XMLHttpRequest) {
  // xhr.responseXML will throw Exception "InvalidStateError" or "DOMException"
  // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseXML.
  try {
    if (xhr.responseType === 'document') {
      return xhr.responseXML;
    }
    const firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === 'parsererror';
    if (xhr.responseType === '' && !firefoxBugTakenEffect) {
      return xhr.responseXML;
    }
  } catch (err) { console.log('getXml: ', err); }

  return null;
}

function isArray(arg: any) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

function parseHeaders(headers: string) {
  if (!headers) { return {}; }

  const result = {};

  headers.trim().split('\n').forEach((row) => {
    const index = row.indexOf(':')
      , key = row.slice(0, index).trim().toLowerCase()
      , value = row.slice(index + 1).trim();

    if (typeof (result[key]) === 'undefined') {
      result[key] = value;
    } else if (isArray(result[key])) {
      result[key].push(value);
    } else {
      result[key] = [result[key], value];
    }
  });

  return result;
}