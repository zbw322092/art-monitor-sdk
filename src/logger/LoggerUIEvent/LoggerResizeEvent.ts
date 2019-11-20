import { LoggerUIEvent } from './LoggerUIEvent';

export class LoggerResizeEvent extends LoggerUIEvent {
  constructor(TrackType: number, resizeEvent: UIEvent) {
    super(TrackType, resizeEvent);

    this.width = (document.defaultView as Window).innerWidth;
    this.height = (document.defaultView as Window).innerHeight;
  }

  public readonly width: number;
  public readonly height: number;
}