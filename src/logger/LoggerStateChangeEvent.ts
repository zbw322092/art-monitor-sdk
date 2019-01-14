import { LoggerEvent } from './LoggerEvent';
import StateChangeEvent from '../utils/lifecycle/StateChangeEvent';

export class LoggerStateChangeEvent extends LoggerEvent {
  constructor(trackType: string, stateChangeEvent: StateChangeEvent) {
    super(trackType, stateChangeEvent as any);

    this.newState = stateChangeEvent.newState;
    this.prevState = stateChangeEvent.prevState;
  }

  public readonly newState: string;
  public readonly prevState: string;
}