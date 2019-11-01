import { LoggerEvent } from '../LoggerEvent/LoggerEvent';

export class LoggerUIEvent extends LoggerEvent {
  constructor(TrackType: number, uiEvent: UIEvent) {
    super(TrackType, uiEvent);

    const { detail } = uiEvent;
    this.detail = detail;
  }

  public readonly detail: number | undefined;
}