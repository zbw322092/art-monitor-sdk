import { LoggerResizeEvent } from '../../logger/LoggerUIEvent/LoggerResizeEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { Event } from '../../enums/EventName';
import { throttle } from '../../utils/throttle';

window.addEventListener(Event.resize, throttle((event) => {
  const resizeLog = new LoggerResizeEvent(TrackType.EVENT_RESIZE, event);
  console.log('Log resize: ', resizeLog);

  iDBStoreInstance.set(OBJECTNAME, resizeLog)
    .then(() => {
      // console.log('resize log added');
    })
    .catch((err) => {
      console.log('resize log err: ', err);
    });
}, 200));