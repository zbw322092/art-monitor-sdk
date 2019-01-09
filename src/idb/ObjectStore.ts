import { proxyProperties, proxyRequestMethods } from './proxies';
import { Index } from './DBIndex';
import { IIndex } from './typing';

export function ObjectStore(store: IDBObjectStore) {
  this._store = store;
}

ObjectStore.prototype.createIndex = function (): IIndex<any, any> {
  return new Index(this._store.createIndex.apply(this._store, arguments));
};

ObjectStore.prototype.index = function (): IIndex<any, any> {
  return new Index(this._store.index.apply(this._store, arguments));
};

proxyProperties(ObjectStore, '_store', [
  'name',
  'keyPath',
  'indexNames',
  'autoIncrement'
]);

proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
  'put',
  'add',
  'delete',
  'clear',
  'get',
  'getAll',
  'getKey',
  'getAllKeys',
  'count'
]);