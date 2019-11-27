import LoggerBase from '../LoggerBase';
// import { getEventTargetInfo } from '../getEventTargetInfo';
import { nodeMirror } from '../../state/nodeMirror';
import { INode } from 'src/snapshot/types';

export class LoggerEvent extends LoggerBase {
  constructor(TrackType: number, event: Event) {
    super(TrackType);

    this.type = event.type;
    this.eventPhase = event.eventPhase;
    // this.currentTarget = getEventTargetInfo(event.currentTarget);
    // this.target = getEventTargetInfo(event.target);
    // console.log('event.currentTarget: ', event.currentTarget);
    // console.log('event.target: ', event.target);
    this.currentTarget = event.currentTarget ? nodeMirror.getId(event.currentTarget as INode) : null;
    this.target = event.target ? nodeMirror.getId(event.target as INode) : null;
  }

  public readonly type: string;
  // public readonly currentTarget: string | null;
  public readonly currentTarget: number | null;
  public readonly eventPhase: number;
  // public readonly target: string | null;
  public readonly target: number | null;
}