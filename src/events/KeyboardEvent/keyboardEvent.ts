import { LoggerKeyboardEvent } from '../../logger/LoggerUIEvent/LoggerKeyboardEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { KeyboardEvent } from '../../enums/EventName';

export function initKeyboardListener() {
  window.addEventListener(KeyboardEvent.keyup, (event) => {
    const keyboardLog = new LoggerKeyboardEvent(TrackType.KEYBOARDEVENT_KEYDOWN, event);
    console.log('keyboard log: ', keyboardLog);

    iDBStoreInstance.set(OBJECTNAME, keyboardLog)
      .then(() => {
        // console.log('keyboard log added');
      })
      .catch((err) => {
        console.log('keyboard log err: ', err);
      });
  });
}