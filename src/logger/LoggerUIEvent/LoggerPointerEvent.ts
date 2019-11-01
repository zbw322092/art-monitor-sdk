import { LoggerMouseEvent } from './LoggerMouseEvent';

export class LoggerPointerEvent extends LoggerMouseEvent {
  constructor(TrackType: number, pointerEvent: PointerEvent) {
    super(TrackType, pointerEvent);

    this.pointerId = pointerEvent.pointerId
  }

  public pointerId: number;
}