import { LoggerKeyboardEvent } from '../logger/LoggerKeyboardEvent';
import { TRACKTYPE } from '../constants/TRACKTYPE';

const mouseEvents = ['keydown'];

mouseEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const keyboardLog = new LoggerKeyboardEvent(TRACKTYPE.KEYBOARDEVENT, event as KeyboardEvent);
    console.log('keyboardLog: ', keyboardLog);
  });
});