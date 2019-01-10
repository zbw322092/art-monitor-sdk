import { LoggerKeyboardEvent } from '../logger/LoggerKeyboardEvent';

const mouseEvents = ['keydown'];

mouseEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const keyboardLog = new LoggerKeyboardEvent(event as KeyboardEvent);
    console.log('keyboardLog: ', keyboardLog);
  });
});