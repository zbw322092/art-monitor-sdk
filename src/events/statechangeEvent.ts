import lifecycle from '../utils/lifecycle';
import { LoggerStateChangeEvent } from '../logger/LoggerStateChangeEvent';

lifecycle.addEventListener('statechange', (event) => {
  const statechangeLogger = new LoggerStateChangeEvent(event as any);
  console.log('statechange logger: ', statechangeLogger);
});