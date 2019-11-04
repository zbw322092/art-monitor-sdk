import { LoggerMouseEvent } from './LoggerMouseEvent';

export class LoggerPointerEvent extends LoggerMouseEvent {
  constructor(TrackType: number, pointerEvent: PointerEvent) {
    super(TrackType, pointerEvent);

    this.pointerId = pointerEvent.pointerId
    this.width = pointerEvent.width;
    this.height = pointerEvent.height;
    this.tangentialPressure = pointerEvent.tangentialPressure;
    this.tiltX = pointerEvent.tiltX;
    this.tiltY = pointerEvent.tiltY;
    this.twist = pointerEvent.twist;
    this.pointerType = pointerEvent.pointerType;
    this.isPrimary = pointerEvent.isPrimary;
  }

  public pointerId: number;
  public width: number;
  public height: number
  public tangentialPressure: number;
  public tiltX: number;
  public tiltY: number;
  public twist: number;
  public pointerType: string;
  public isPrimary: boolean;
}