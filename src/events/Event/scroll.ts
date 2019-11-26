import { LoggerScrollEvent } from '../../logger/LoggerEvent/LoggerScroll';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { Event } from '../../enums/EventName';
import { throttle } from '../../utils/throttle';
import { pageScroll } from 'src/state/pageScroll';

export function initScrollListener() {
  window.addEventListener(Event.scroll, throttle((event) => {
    const loggerEvent = new LoggerScrollEvent(TrackType.EVENT_SCROLL, event);
    pageScroll.setPageScroll(loggerEvent.scrollX, loggerEvent.scrollY);
    console.log('log scroll: ', loggerEvent);
  
    iDBStoreInstance.set(OBJECTNAME, loggerEvent)
      .then(() => {
        // console.log('scroll log added');
      })
      .catch((err) => {
        console.log('scroll log err: ', err);
      });
  }, 200));
}
