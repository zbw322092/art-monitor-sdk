import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { Event } from '../../enums/EventName';
import { LoggerInputEvent } from '../../logger/LoggerUIEvent/LoggerInputEvent';

export function initInputListener() {
  window.addEventListener(Event.input, (event) => {
    // TODO range input type generate too many logs, optimize it
    const inputEvent = new LoggerInputEvent(TrackType.INPUTEVENT_INPUT, event as InputEvent);
  
    iDBStoreInstance.set(OBJECTNAME, inputEvent)
      .then(() => {
      })
      .catch((err) => {
        console.log('input log err: ', err);
      });
  });
}
