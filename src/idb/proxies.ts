import { promisifyRequestCall, promisifyCursorRequestCall } from './promisifyRequest';

export const proxyProperties = (
  ProxyClass: Function,
  targetProp: string,
  properties: string[]
): void => {

  properties.forEach((prop) => {
    Object.defineProperty(ProxyClass.prototype, prop, {
      get() {
        return this[targetProp][prop];
      },
      set(val) {
        return this[targetProp][prop] = val;
      }
    });
  });

};

export const proxyRequestMethods = (
  ProxyClass: Function,
  targetProp: string,
  Constructor: Function,
  properties: string[]
): void => {

  properties.forEach((prop) => {
    if (!(prop in Constructor.prototype)) { return; }

    ProxyClass.prototype[prop] = function () {
      return promisifyRequestCall(this[targetProp], prop, arguments);
    };
  });

};

export function proxyMethods(
  ProxyClass: Function,
  targetProp: string,
  Constructor: Function,
  properties: string[]
): void {

  properties.forEach((prop) => {
    if (!(prop in Constructor.prototype)) { return; }

    ProxyClass.prototype[prop] = function () {
      return this[targetProp][prop].apply(this[targetProp], arguments);
    };
  });

}

export const proxyCursorRequestMethods = (
  ProxyClass: Function,
  targetProp: string,
  Constructor: Function,
  properties: string[],
  Cursor
) => {

  properties.forEach((prop) => {
    if (!(prop in Constructor.prototype)) return;

    ProxyClass.prototype[prop] = function () {
      return promisifyCursorRequestCall(this[targetProp], prop, arguments, Cursor);
    };
  });

};