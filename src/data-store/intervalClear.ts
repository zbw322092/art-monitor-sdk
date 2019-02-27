import { iDBStoreInstance } from './IDBStore';
import { OBJECTNAME, CLEARINTERVAL, CLEARRANGELOW, CLEARRANGEHIGH, OFFSET } from '../constants/DB';

window.setInterval(() => {
  const now = performance.now();
  const range = IDBKeyRange.bound(now - CLEARRANGELOW - OFFSET, now - CLEARRANGEHIGH + OFFSET);
  let count = 0;
  let minIndex: number, maxIndex: number;

  iDBStoreInstance.getDBPromise()
    .then((db) => {
      const transaction = db.transaction(OBJECTNAME);
      const store = transaction.objectStore(OBJECTNAME);
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
      iDBStoreInstance.delete(OBJECTNAME, IDBKeyRange.bound(minIndex, maxIndex))
        .then(() => {
          console.log(`${count} records deleted`);
        })
        .catch((err) => {
          console.log(`delete record has err: `, err);
        });
    });
}, CLEARINTERVAL);