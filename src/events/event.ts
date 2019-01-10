import { LoggerEvent } from '../logger/LoggerEvent';

let scrollTimeout: number | null;
window.addEventListener('scroll', (event) => {
  if (scrollTimeout) { return; }

  const scrollLog = new LoggerEvent(event);
  console.log('scrollLog: ', scrollLog);

  scrollTimeout = window.setTimeout(() => {
    scrollTimeout = null;
  }, 1000);
});

let resizeTimeout: number | null;
window.addEventListener('resize', (event) => {
  if (resizeTimeout) { return; }

  const resizeLog = new LoggerEvent(event);
  console.log('resizeLog: ', resizeLog);

  resizeTimeout = window.setTimeout(() => {
    resizeTimeout = null;
  }, 1000);
});