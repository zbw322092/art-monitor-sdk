import { LoggerFocusEvent } from '../../logger/LoggerUIEvent/LoggerFocusEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { FocusEvent } from '../../enums/EventName';

window.addEventListener(FocusEvent.focusin, (event) => {
  const loggerFocusEvent = new LoggerFocusEvent(TrackType.FOCUSEVENT_FOCUSIN, event as any);
  console.log('Log Focusin: ', loggerFocusEvent);

  iDBStoreInstance.set(OBJECTNAME, loggerFocusEvent)
    .then(() => {
      // console.log('click log added');
    })
    .catch((err) => {
      console.log('focus log err: ', err);
    });
});

window.addEventListener(FocusEvent.focusout, (event) => {
  const loggerFocusEvent = new LoggerFocusEvent(TrackType.FOCUSEVENT_FOCUSOUT, event as any);
  console.log('Log Focusout: ', loggerFocusEvent);

  iDBStoreInstance.set(OBJECTNAME, loggerFocusEvent)
    .then(() => {
      // console.log('click log added');
    })
    .catch((err) => {
      console.log('focus log err: ', err);
    });
});