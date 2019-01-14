import { LoggerTouchEvent } from '../logger/LoggerTouchEvent';
import { TRACKTYPE } from '../constants/TRACKTYPE';

const touchEvents = ['touchstart', 'touchend'];

touchEvents.forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    const touchLog = new LoggerTouchEvent(TRACKTYPE.TOUCHEVENT, event as TouchEvent);
    console.log('touchLog: ', touchLog);
  });
});

let touchmoveTimeout: number | null;
window.addEventListener('touchmove', (event) => {
  if (touchmoveTimeout) { return; }
  const touchmoveLog = new LoggerTouchEvent(TRACKTYPE.TOUCHEVENT, event);
  console.log('touchmoveLog: ', touchmoveLog);

  touchmoveTimeout = window.setTimeout(() => {
    touchmoveTimeout = null;
  }, 1000);
});