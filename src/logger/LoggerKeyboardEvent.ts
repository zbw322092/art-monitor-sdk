import { LoggerUIEvent } from './LoggerUIEvent';

export class LoggerKeyboardEvent extends LoggerUIEvent {
  constructor(TrackType: number, keyboardEvent: KeyboardEvent) {
    super(TrackType, keyboardEvent);

    this.altKey = keyboardEvent.altKey;
    this.code = keyboardEvent.code;
    this.ctrlKey = keyboardEvent.ctrlKey;
    this.key = keyboardEvent.key;
    this.location = keyboardEvent.location;
    this.metaKey = keyboardEvent.metaKey;
    this.repeat = keyboardEvent.repeat;
    this.shiftKey = keyboardEvent.shiftKey;
  }

  public readonly altKey: boolean;
  public readonly code: string;
  public readonly ctrlKey: boolean;
  public readonly key: string;
  public readonly location: number;
  public readonly metaKey: boolean;
  public readonly repeat: boolean;
  public readonly shiftKey: boolean;
}