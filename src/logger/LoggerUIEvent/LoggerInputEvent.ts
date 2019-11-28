import { LoggerUIEvent } from './LoggerUIEvent';
import { InputType } from '../../enums/InputType';

export class LoggerInputEvent extends LoggerUIEvent {
  constructor(TrackType: number, inputEvent: InputEvent) {
    super(TrackType, inputEvent);

    // this.inputType = inputEvent.inputType;
    this.inputType = InputType[inputEvent.inputType];
    this.isComposing = inputEvent.isComposing;
    this.isMasked = this.isMaskedInput(inputEvent);
    this.data = this.isMasked ? null : inputEvent.data;
    const value = inputEvent.target &&
      (inputEvent.target as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)).value || '';
    this.inputTargetValue = this.isMasked ? null : value;
    this.inputTargetValueLength = this.isMasked ? value.length : null;
  }

  public readonly data: string | null;
  public readonly inputType: number;
  public readonly isComposing: boolean;
  public readonly isMasked: boolean;
  public readonly inputTargetValue: string | null;
  public readonly inputTargetValueLength: number | null;

  protected isMaskedInput(inputEvent: InputEvent): boolean {
    const { target } = inputEvent;
    const maskedInputTypes = ['email', 'number', 'password', 'search', 'tel', 'text', 'url'];
    if (
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLInputElement && maskedInputTypes.includes(target.type ))
    ) {
      return true;
    }
    return false;
  }
}