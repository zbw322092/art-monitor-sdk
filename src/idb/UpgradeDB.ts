import { Transaction } from './Transaction';
import { ObjectStore } from './ObjectStore';
import { proxyProperties, proxyMethods } from './proxies';
import { IObjectStore } from './typing';

export function UpgradeDB(db: IDBDatabase, oldVersion: number, transaction: IDBTransaction | null) {
  this._db = db;
  this.oldVersion = oldVersion;
  this.transaction = transaction ? new Transaction(transaction) : null;
}

UpgradeDB.prototype.createObjectStore = function (): IObjectStore<any, any> {
  return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
};

proxyProperties(UpgradeDB, '_db', [
  'name',
  'version',
  'objectStoreNames'
]);

proxyMethods(UpgradeDB, '_db', IDBDatabase, [
  'deleteObjectStore',
  'close'
]);