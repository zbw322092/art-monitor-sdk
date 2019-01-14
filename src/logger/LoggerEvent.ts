import LoggerBase from './LoggerBase';
import { getEventTargetInfo } from './getEventTargetInfo';

export class LoggerEvent extends LoggerBase {
  constructor(trackType: string, event: Event) {
    super(trackType);

    this.type = event.type;
    this.eventPhase = event.eventPhase;
    this.currentTarget = getEventTargetInfo(event.currentTarget);
    this.target = getEventTargetInfo(event.target);
  }

  public readonly type: string;
  public readonly currentTarget: string | null;
  public readonly eventPhase: number;
  public readonly target: string | null;
}