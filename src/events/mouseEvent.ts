import { LoggerMouseEvent } from '../logger/LoggerMouseEvent';

const body = document.querySelector('body');

if (body) {
  const mouseEvents = [ 'click', 'dblclick' ];

  mouseEvents.forEach((eventName) => {
    window.addEventListener(eventName, (event) => {
      const clickLog = new LoggerMouseEvent(event as MouseEvent);
      console.log(event);
      console.log('clickLog: ', clickLog);
    });
  });
}