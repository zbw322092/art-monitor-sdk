import { LoggerEvent } from './LoggerEvent';

export class LoggerScrollEvent extends LoggerEvent {
  constructor(TrackType: number, event: Event) {
    super(TrackType, event);

    this.scrollX = window.scrollX;
    this.scrollY = window.scrollY;
  }

  public readonly scrollX: number;
  public readonly scrollY: number;
}