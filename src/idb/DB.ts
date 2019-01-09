import { proxyProperties, proxyMethods } from './proxies';
import { Transaction } from './Transaction';
import { ITransaction } from './typing';

export function DB(db: IDBDatabase) {
  this._db = db;
}

proxyProperties(DB, '_db', [
  'name',
  'version',
  'objectStoreNames'
]);

proxyMethods(DB, '_db', IDBDatabase, [
  'close'
]);

DB.prototype.transaction = function (): ITransaction {
  return new Transaction(this._db.transaction.apply(this._db, arguments));
};