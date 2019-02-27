import { LoggerKeyboardEvent } from '../logger/LoggerKeyboardEvent';
import { TrackType } from '../enums/TrackType';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

const mouseEvents = ['keydown'];

mouseEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const keyboardLog = new LoggerKeyboardEvent(TrackType.KEYBOARDEVENT, event as KeyboardEvent);
    console.log('keyboard log: ', keyboardLog);

    iDBStoreInstance.set(OBJECTNAME, keyboardLog)
      .then(() => {
        console.log('keyboard log added');
      })
      .catch((err) => {
        console.log('keyboard log err: ', err);
      });
  });
});