import { LoggerMouseEvent } from '../logger/LoggerMouseEvent';
import { TRACKTYPE } from '../constants/TRACKTYPE';

const mouseEvents = ['click', 'dblclick'];

mouseEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const clickLog = new LoggerMouseEvent(TRACKTYPE.MOUSEEVENT, event as MouseEvent);
    console.log('clickLog: ', clickLog);
  });
});
