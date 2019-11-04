import { PointerEvent } from "../../enums/EventName";
import { LoggerPointerEvent } from '../../logger/LoggerUIEvent/LoggerPointerEvent';
import { TrackType } from "../../enums/TrackType";
import { iDBStoreInstance } from "../../data-store/IDBStore";
import { OBJECTNAME } from '../../constants/DB';
import { throttle } from "../../utils/throttle";

window.addEventListener(PointerEvent.pointermove, throttle((event) => {
  
  const loggerPointerEvent = new LoggerPointerEvent(TrackType.POINTEREVENT_POINTERMOVE, event);
  console.log('Log Pointer: ', loggerPointerEvent);

  iDBStoreInstance.set(OBJECTNAME, loggerPointerEvent)
    .then(() => {
      // console.log('click log added');
    })
    .catch((err) => {
      console.log('click log err: ', err);
    });
}, 200));