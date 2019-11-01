import { LoggerEvent } from '../../logger/LoggerEvent/LoggerEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { Event } from '../../enums/EventName';
import { throttle } from '../../utils/throttle';

window.addEventListener(Event.scroll, throttle((event) => {
  const loggerEvent = new LoggerEvent(TrackType.EVENT_SCROLL, event);
  console.log('Log Scroll: ', loggerEvent);

  iDBStoreInstance.set(OBJECTNAME, loggerEvent)
    .then(() => {
      // console.log('scroll log added');
    })
    .catch((err) => {
      console.log('scroll log err: ', err);
    });
}, 200));