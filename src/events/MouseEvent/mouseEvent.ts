import { LoggerMouseEvent } from '../../logger/LoggerUIEvent/LoggerMouseEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { MouseEvent } from '../../enums/EventName';

export function initMouseListener() {
  window.addEventListener(MouseEvent.click, (event) => {
    const clickLog = new LoggerMouseEvent(TrackType.MOUSEEVENT_CLICK, event);
    console.log('log click: ', clickLog);
  
    iDBStoreInstance.set(OBJECTNAME, clickLog)
      .then(() => {
        // console.log('click log added');
      })
      .catch((err) => {
        console.log('click log err: ', err);
      });
  });
}