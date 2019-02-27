import { LoggerEvent } from '../logger/LoggerEvent';
import { TrackType } from '../enums/TrackType';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

let scrollTimeout: number | null;
window.addEventListener('scroll', (event) => {
  if (scrollTimeout) { return; }

  const scrollLog = new LoggerEvent(TrackType.EVENT, event);
  console.log('scroll log: ', scrollLog);

  iDBStoreInstance.set(OBJECTNAME, scrollLog)
    .then(() => {
      console.log('scroll log added');
    })
    .catch((err) => {
      console.log('scroll log err: ', err);
    });

  scrollTimeout = window.setTimeout(() => {
    scrollTimeout = null;
  }, 1000);
});

let resizeTimeout: number | null;
window.addEventListener('resize', (event) => {
  if (resizeTimeout) { return; }

  const resizeLog = new LoggerEvent(TrackType.EVENT, event);
  console.log('resize log: ', resizeLog);

  iDBStoreInstance.set(OBJECTNAME, resizeLog)
    .then(() => {
      console.log('resize log added');
    })
    .catch((err) => {
      console.log('resize log err: ', err);
    });

  resizeTimeout = window.setTimeout(() => {
    resizeTimeout = null;
  }, 1000);
});