import { proxyProperties, proxyMethods } from './proxies';
import { ObjectStore } from './ObjectStore';
import { IObjectStore } from './typing';

export function Transaction(idbTransaction: IDBTransaction) {
  this._tx = idbTransaction;
  this.complete = new Promise((resolve, reject) => {
    idbTransaction.oncomplete = () => {
      resolve();
    };
    idbTransaction.onerror = () => {
      reject(idbTransaction.error);
    };
    idbTransaction.onabort = () => {
      reject(idbTransaction.error);
    };
  });
}

Transaction.prototype.objectStore = function (): IObjectStore<any, any> {
  return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
};

proxyProperties(Transaction, '_tx', [
  'objectStoreNames',
  'mode'
]);

proxyMethods(Transaction, '_tx', IDBTransaction, [
  'abort'
]);