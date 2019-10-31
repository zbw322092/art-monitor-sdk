import { LoggerEvent } from './LoggerEvent';

export class LoggerError extends LoggerEvent {
  constructor(TrackType: number, errorEvent: ErrorEvent) {
    super(TrackType, errorEvent);

    this.message = errorEvent.message;
    this.filename = errorEvent.filename;
    this.lineno = errorEvent.lineno;
    this.colno = errorEvent.colno;
    this.error = JSON.stringify(errorEvent.error);
  }

  public readonly message: string;
  public readonly filename: string;
  public readonly lineno: number;
  public readonly colno: number;
  public readonly error: any;
}