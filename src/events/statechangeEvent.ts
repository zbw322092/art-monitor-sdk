import lifecycle from '../utils/lifecycle/index';
import { LoggerStateChangeEvent } from '../logger/LoggerStateChangeEvent';
import { TRACKTYPE } from '../constants/TRACKTYPE';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

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
});