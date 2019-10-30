import './constants/TRACKID';

import './interceptor';
// import './mutation-observer';
// import './events';
import './performance';
import './utils/idb';
import './data-store/intervalClear';

import './error-tracking/errorListener';

import record from './recorder/index';

const events: any[] = [];
record({
  emit(event) {
    console.log('recorded event: ', event);
    events.push(event);
  }
});

