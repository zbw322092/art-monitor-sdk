import { Event } from '../../enums/EventName';
import { LoggerNetwork } from '../../logger/LoggerEvent/LoggerNetwork';
import { TrackType } from '../../enums/TrackType';

window.addEventListener(Event.online, (event) => {
  console.log('You are now connected to the network.');
  const log = new LoggerNetwork(TrackType.EVENT_NETWORKEVENT, event);
  console.log('Log network event: ', log);
});

window.addEventListener(Event.offline, (event) => {
  console.log('The network connection has been lost.');
  const log = new LoggerNetwork(TrackType.EVENT_NETWORKEVENT, event);
  console.log('Log network event: ', log);
});