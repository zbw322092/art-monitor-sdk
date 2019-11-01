import { LoggerUIEvent } from './LoggerUIEvent';
import { getEventTargetInfo } from '../getEventTargetInfo';

export class LoggerTouchEvent extends LoggerUIEvent {
  constructor(TrackType: number , touchEvent: TouchEvent) {
    super(TrackType, touchEvent);

    this.altKey = touchEvent.altKey;
    this.changedTouches = JSON.stringify(formatTouchList(touchEvent.changedTouches));
    this.ctrlKey = touchEvent.ctrlKey;
    this.metaKey = touchEvent.metaKey;
    this.shiftKey = touchEvent.shiftKey;
    this.targetTouches = JSON.stringify(formatTouchList(touchEvent.targetTouches));
    this.touches = JSON.stringify(formatTouchList(touchEvent.touches));
  }

  public readonly altKey: boolean;
  public readonly changedTouches: string;
  public readonly ctrlKey: boolean;
  public readonly metaKey: boolean;
  public readonly shiftKey: boolean;
  public readonly targetTouches: string;
  public readonly touches: string;
}

function formatTouchList(touchList: TouchList) {
  const keys = [
    'altitudeAngle', 'azimuthAngle', 'clientX', 'clientY', 'force', 'identifier', 'pageX',
    'pageY', 'radiusX', 'radiusY', 'rotationAngle', 'screenX', 'screenY', 'target'
  ];
  return Array.prototype.map.call(touchList, (touch: Touch) => {
    const forattedTouch = {};
    keys.forEach((key) => {
      if (key === 'target') {
        forattedTouch[key] = getEventTargetInfo(touch[key]);
      } else {
        forattedTouch[key] = touch[key];
      }
    });

    return forattedTouch;
  });
}