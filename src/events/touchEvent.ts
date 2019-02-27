import { LoggerTouchEvent } from '../logger/LoggerTouchEvent';
import { TrackType } from '../enums/TrackType';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

const touchEvents = ['touchstart', 'touchend'];

touchEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const touchLog = new LoggerTouchEvent(TrackType.TOUCHEVENT, event as TouchEvent);
    console.log('touchLog: ', touchLog);

    iDBStoreInstance.set(OBJECTNAME, touchLog)
      .then(() => {
        console.log('touch log added');
      })
      .catch((err) => {
        console.log('touch log err: ', err);
      });
  });
});

let touchmoveTimeout: number | null;
window.addEventListener('touchmove', (event) => {
  if (touchmoveTimeout) { return; }
  const touchmoveLog = new LoggerTouchEvent(TrackType.TOUCHEVENT, event);
  console.log('touchmoveLog: ', touchmoveLog);

  iDBStoreInstance.set(OBJECTNAME, touchmoveLog)
      .then(() => {
        console.log('touch log added');
      })
      .catch((err) => {
        console.log('touch log err: ', err);
      });

  touchmoveTimeout = window.setTimeout(() => {
    touchmoveTimeout = null;
  }, 1000);
});