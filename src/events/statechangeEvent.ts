import lifecycle from '../utils/lifecycle/index';
import { LoggerStateChangeEvent } from '../logger/LoggerStateChangeEvent';
import { TRACKTYPE } from '../constants/TRACKTYPE';

lifecycle.addEventListener('statechange', (event) => {
  const statechangeLogger = new LoggerStateChangeEvent(TRACKTYPE.STATECHANGE, event as any);
  console.log('statechange logger: ', statechangeLogger);
});