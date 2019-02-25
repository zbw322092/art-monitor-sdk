import idb from '../utils/idb/index';
import { IDB, IUpgradeDB } from '../utils/idb/typing';
import { DBVERSION, DBNAME, OBJECTNAME, KETPATH } from '../constants/DB';

export class IDBStore {
  constructor(dbName: string, upgradeCallback: (upgradeDB: IUpgradeDB) => any) {
    this.dbPromise = idb.open(dbName, DBVERSION, upgradeCallback);
  }
  private dbPromise: Promise<IDB>;

  public get = (objName: string, key: string): Promise<any> => {
    return this.dbPromise.then((db) => {
      return db.transaction(objName)
        .objectStore(objName).get(key);
    });
  }

  public set = (objName: string, val: any): Promise<void> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(objName, 'readwrite');
      tx.objectStore(objName).put(val);
      return tx.complete;
    });
  }

  public delete = (objName: string, key: any): Promise<void> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(objName, 'readwrite');
      tx.objectStore(objName).delete(key);
      return tx.complete;
    });
  }

  public clear = (objName: string): Promise<void> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(objName, 'readwrite');
      tx.objectStore(objName).clear();
      return tx.complete;
    });
  }

  public getDBPromise = () => {
    return this.dbPromise;
  }

  public keys = (objName: string): Promise<string[]> => {
    return this.dbPromise.then((db) => {
      const tx = db.transaction(objName);
      const keys: string[] = [];
      const store = tx.objectStore(objName);

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

  public deleteDataBase (dbName: string): Promise<any> {
    return idb.delete(dbName)
      .then(() => {
        console.log(`delete ${dbName} database successfully`);
      })
      .catch((err) => {
        console.log(`delete ${dbName} database err: `, err);
      });
  }
}

export const iDBStoreInstance = new IDBStore(DBNAME, (upgradeDB) => {
  if (!upgradeDB.objectStoreNames.contains(OBJECTNAME)) {
    const objectStore = upgradeDB.createObjectStore(OBJECTNAME, { keyPath: KETPATH, autoIncrement: true });
    objectStore.createIndex('timestamp', 'timestamp');
  }
});