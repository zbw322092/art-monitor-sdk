import { iDBStoreInstance } from './IDBStore';
import { OBJECTNAME } from '../constants/DB';

// window.setInterval(() => {
//   iDBStoreInstance.keys(OBJECTNAME)
//     .then((keys) => {
//       console.log('keys: ', keys);
//     });

//   let range;
//   range = IDBKeyRange.bound(1000, 100000);

//   iDBStoreInstance.getDBPromise()
//     .then((db) => {
//       const transaction = db.transaction(OBJECTNAME);
//       const store = transaction.objectStore(OBJECTNAME);
//       const index = store.index('timestamp');
//       return index.openCursor(range);
//     }).then(function showRange(cursor) {
//       if (!cursor) { return; }
//       console.log('Cursored at:', cursor.key);
//       // for (const field in cursor.value) {
//       //   if (cursor.value.hasOwnProperty(field)) {
//       //     console.log('cursor.value[field]: ', cursor.value[field]);
//       //   }
//       // }
//       return cursor.continue().then(showRange);
//     }).then(function () {
//       console.log('Done cursoring');
//     });
// }, 10000);