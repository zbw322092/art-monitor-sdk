import { promisifyRequest, promisifyRequestCall } from './promisifyRequest';
import { Cursor } from './Cursor';
import { ObjectStore } from './ObjectStore';
import { Index } from './DBIndex';
import { UpgradeDB } from './UpgradeDB';
import { DB } from './db';
import { IUpgradeDB, IDB } from './typing';

function toArray(arr) {
  return Array.prototype.slice.call(arr);
}

['advance', 'continue', 'continuePrimaryKey'].forEach((methodName) => {
  if (!(methodName in IDBCursor.prototype)) { return; }
  Cursor.prototype[methodName] = function () {
    const cursor = this;
    const args = arguments;

    return Promise.resolve().then(() => {
      cursor._cursor[methodName].apply(cursor._cursor, args);

      return promisifyRequest(cursor._request).then((value) => {
        if (!value) { return; }
        return new Cursor(value, cursor._request);
      });
    });
  };
});

// Add cursor iterators
['openCursor', 'openKeyCursor'].forEach((funcName) => {
  [ObjectStore, Index].forEach((Constructor) => {
    // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
    if (!(funcName in Constructor.prototype)) { return; }

    Constructor.prototype[funcName.replace('open', 'iterate')] = function () {
      const args = toArray(arguments);
      const callback = args[args.length - 1];
      const nativeObject = this._store || this._index;
      const request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
      request.onsuccess = () => {
        callback(request.result);
      };
    };
  });
});

// polyfill getAll
[Index, ObjectStore].forEach((Constructor) => {
  if (Constructor.prototype.getAll) return;
  Constructor.prototype.getAll = function (query, count) {
    const instance = this;
    const items: any[] = [];

    return new Promise((resolve) => {
      instance.iterateCursor(query, (cursor) => {
        if (!cursor) {
          resolve(items);
          return;
        }
        items.push(cursor.value);

        if (count !== undefined && items.length === count) {
          resolve(items);
          return;
        }
        cursor.continue();
      });
    });
  };
});

export const idb = {
  open: (name: string, version: number, upgradeCallback?: (db: IUpgradeDB) => void): Promise<IDB> => {
    const promiseWithReq = promisifyRequestCall(indexedDB, 'open', [name, version]);
    const request = promiseWithReq.request;

    if (request) {
      (request as IDBOpenDBRequest).onupgradeneeded = (event: IDBVersionChangeEvent) => {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };
    }

    return promiseWithReq.then((db: IDBDatabase) => {
      return new DB(db);
    });
  },
  delete: (name: string): Promise<void> => {
    return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
  }
};