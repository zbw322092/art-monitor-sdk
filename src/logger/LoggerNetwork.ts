import { LoggerEvent } from './LoggerEvent';

export class LoggerNetwork extends LoggerEvent {
  constructor(TrackType: number, event: Event) {
    super(TrackType, event);
  }
  
}