import { LoggerUIEvent } from './LoggerUIEvent';
import { getEventTargetInfo } from '../getEventTargetInfo';

export class LoggerFocusEvent extends LoggerUIEvent {
  constructor(TrackType: number, focusEvent: FocusEvent) {
    super(TrackType, focusEvent);

    this.relatedTarget = getEventTargetInfo(focusEvent.relatedTarget);
  }

  // TODO
  public relatedTarget: string | null;
}