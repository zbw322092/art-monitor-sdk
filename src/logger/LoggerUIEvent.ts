import { LoggerEvent } from './LoggerEvent';

export class LoggerUIEvent extends LoggerEvent {
  constructor(uiEvent: UIEvent) {
    super(uiEvent);

    const { detail } = uiEvent;
    this.detail = detail;
  }

  public readonly detail: number | undefined;
}