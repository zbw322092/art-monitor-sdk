import { LoggerMouseEvent } from '../logger/LoggerMouseEvent';

const mouseEvents = ['click', 'dblclick'];

mouseEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const clickLog = new LoggerMouseEvent(event as MouseEvent);
    console.log('clickLog: ', clickLog);
  });
});
