import idb from '../utils/idb/index';
import { IDB } from '../utils/idb/typing';

export class IDBStore {
  constructor(dbName: string, objName: string, keyPath: string) {
    this.dbPromise = idb.open(dbName, 1, (upgradeDB) => {
      upgradeDB.createObjectStore(objName, { keyPath, autoIncrement: true });
    });
    this.objName = objName;
  }
  private dbPromise: Promise<IDB>;
  private objName: string;

  public get = (key: string): Promise<any> => {
    return this.dbPromise.then((db) => {
      return db.transaction(this.objName)
        .objectStore(this.objName).get(key);
    });
  }

  public set = (val: any): Promise<void> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(this.objName, 'readwrite');
      tx.objectStore(this.objName).put(val);
      return tx.complete;
    });
  }

  public delete = (key: string): Promise<void> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(this.objName, 'readwrite');
      tx.objectStore(this.objName).delete(key);
      return tx.complete;
    });
  }

  public clear = (): Promise<void> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(this.objName, 'readwrite');
      tx.objectStore(this.objName).clear();
      return tx.complete;
    });
  }

  public keys = (): Promise<string[]> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(this.objName);
      const keys: string[] = [];
      const store = tx.objectStore(this.objName);

      // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
      // openKeyCursor isn't supported by Safari, so we fall back
      (store.iterateKeyCursor || store.iterateCursor).call(store, (cursor) => {
        if (!cursor) { return; }
        keys.push(cursor.key);
        cursor.continue();
      });

      return tx.complete.then(() => {
        return keys;
      });
    });
  }
}