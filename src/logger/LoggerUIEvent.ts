import { LoggerEvent } from './LoggerEvent';

export class LoggerUIEvent extends LoggerEvent {
  constructor(trackType: string, uiEvent: UIEvent) {
    super(trackType, uiEvent);

    const { detail } = uiEvent;
    this.detail = detail;
  }

  public readonly detail: number | undefined;
}