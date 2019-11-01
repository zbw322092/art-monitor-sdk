import { LoggerEvent } from './LoggerEvent/LoggerEvent';
import StateChangeEvent from '../utils/lifecycle/StateChangeEvent';

export class LoggerStateChangeEvent extends LoggerEvent {
  constructor(TrackType: number, stateChangeEvent: StateChangeEvent) {
    super(TrackType, stateChangeEvent as any);

    this.newState = stateChangeEvent.newState;
    this.prevState = stateChangeEvent.prevState;
  }

  public readonly newState: string;
  public readonly prevState: string;
}