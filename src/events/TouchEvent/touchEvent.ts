import { LoggerTouchEvent } from '../../logger/LoggerUIEvent/LoggerTouchEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { TouchEvent } from '../../enums/EventName';
import { throttle } from '../../utils/throttle';

window.addEventListener(TouchEvent.touchstart, (event) => {
  const touchStartLog = new LoggerTouchEvent(TrackType.TOUCHEVENT_TOUCHSTART, event);
  console.log('Log Touch Start: ', touchStartLog);

  iDBStoreInstance.set(OBJECTNAME, touchStartLog)
    .then(() => {
      // console.log('touch log added');
    })
    .catch((err) => {
      console.log('touch log err: ', err);
    });
});

window.addEventListener(TouchEvent.touchmove, throttle((event) => {
  const touchmoveLog = new LoggerTouchEvent(TrackType.TOUCHEVENT_TOUCHMOVE, event);
  console.log('Log Touch Move: ', touchmoveLog);

  iDBStoreInstance.set(OBJECTNAME, touchmoveLog)
    .then(() => {
      // console.log('touch log added');
    })
    .catch((err) => {
      console.log('touch log err: ', err);
    });
}, 200));

window.addEventListener(TouchEvent.touchend, (event) => {
  const touchEndLog = new LoggerTouchEvent(TrackType.TOUCHEVENT_TOUCHEND, event);
  console.log('Log Touch End: ', touchEndLog);

  iDBStoreInstance.set(OBJECTNAME, touchEndLog)
    .then(() => {
      // console.log('touch log added');
    })
    .catch((err) => {
      console.log('touch log err: ', err);
    });
});

window.addEventListener(TouchEvent.touchcancel, (event) => {
  const touchCancelLog = new LoggerTouchEvent(TrackType.TOUCHEVENT_TOUCHCANCEL, event);
  console.log('Log Touch Cancel: ', touchCancelLog);

  iDBStoreInstance.set(OBJECTNAME, touchCancelLog)
    .then(() => {
      // console.log('touch log added');
    })
    .catch((err) => {
      console.log('touch log err: ', err);
    });
});