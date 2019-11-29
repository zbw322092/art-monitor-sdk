import lifecycle from '../../utils/lifecycle/index';
import { LoggerStateChangeEvent } from '../../logger/LoggerStateChangeEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME, DBNAME } from '../../constants/DB';
import { PageState } from '../../utils/lifecycle/enums/PageState';
import { CustomEvent } from '../../enums/EventName';

export function initStateChangeListener() {
  lifecycle.addEventListener(CustomEvent.statechange, (event) => {
    const statechangeLogger = new LoggerStateChangeEvent(TrackType.STATECHANGE, event as any);
    console.log('STATECHANGE LOG: ', statechangeLogger);
  
    iDBStoreInstance.set(OBJECTNAME, statechangeLogger)
      .then(() => {
        // console.log('statechange log added');
      })
      .catch((err) => {
        console.log('statechange log err: ', err);
      });
  
    const newState = statechangeLogger.newState;
    if (newState === PageState.TERMINATED) {
      iDBStoreInstance.deleteDataBase(DBNAME);
    }
  });
}