import lifecycle from '../utils/lifecycle/index';
import { LoggerStateChangeEvent } from '../logger/LoggerStateChangeEvent';
import { TRACKTYPE } from '../constants/TRACKTYPE';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME, DBNAME } from '../constants/DB';
import { PageState } from '../utils/lifecycle/enums/PageState';

lifecycle.addEventListener('statechange', (event) => {
  const statechangeLogger = new LoggerStateChangeEvent(TRACKTYPE.STATECHANGE, event as any);
  console.log('statechange log: ', statechangeLogger);

  iDBStoreInstance.set(OBJECTNAME, statechangeLogger)
    .then(() => {
      console.log('statechange log added');
    })
    .catch((err) => {
      console.log('statechange log err: ', err);
    });

  const newState = statechangeLogger.newState;
  if (newState === PageState.TERMINATED) {
    iDBStoreInstance.deleteDataBase(DBNAME);
  }
});