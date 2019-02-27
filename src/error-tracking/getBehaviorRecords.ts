import { CLEARINTERVAL, OBJECTNAME } from '../constants/DB';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { IObjectStore } from '../utils/idb/typing';

export const getBehaviorRecords = (): Promise<any[]> => {
  const now = performance.now();
  const range = IDBKeyRange.bound(now - CLEARINTERVAL, now);
  let count = 0;
  let minIndex: number, maxIndex: number;
  let store: IObjectStore<any, any>;

  return iDBStoreInstance.getDBPromise()
    .then((db) => {
      const transaction = db.transaction(OBJECTNAME);
      store = transaction.objectStore(OBJECTNAME);
      const index = store.index('timestamp');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) { return; }
      const primaryKey = cursor.primaryKey;
      if (minIndex === undefined) {
        minIndex = primaryKey;
      }
      if (maxIndex === undefined) {
        maxIndex = primaryKey;
      }
      minIndex = primaryKey < minIndex ? primaryKey : minIndex;
      maxIndex = primaryKey > maxIndex ? primaryKey : maxIndex;
      count++;
      return cursor.continue().then(showRange);
    }).then(function () {
      if (minIndex === maxIndex) {
        console.log('no new records');
        return;
      }
      return store.getAll(IDBKeyRange.bound(minIndex, maxIndex))
        .then((records) => {
          console.log(`got ${count} records`);
          return records;
        })
        .catch((err) => {
          return err;
        });
    });
};