import { LoggerEvent } from './LoggerEvent';

export class LoggerUIEvent extends LoggerEvent {
  constructor(TrackType: string, uiEvent: UIEvent) {
    super(TrackType, uiEvent);

    const { detail } = uiEvent;
    this.detail = detail;
  }

  public readonly detail: number | undefined;
}