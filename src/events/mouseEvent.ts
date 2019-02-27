import { LoggerMouseEvent } from '../logger/LoggerMouseEvent';
import { TrackType } from '../enums/TrackType';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

const mouseEvents = ['click', 'dblclick'];

mouseEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const clickLog = new LoggerMouseEvent(TrackType.MOUSEEVENT, event as MouseEvent);
    console.log('click log: ', clickLog);

    iDBStoreInstance.set(OBJECTNAME, clickLog)
      .then(() => {
        console.log('click log added');
      })
      .catch((err) => {
        console.log('click log err: ', err);
      });
  });
});
