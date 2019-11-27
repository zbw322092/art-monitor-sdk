import { LoggerEvent } from './LoggerEvent';
import { nodeMirror } from 'src/state/nodeMirror';
import { INode } from 'src/snapshot/types';

export class LoggerSelection extends LoggerEvent {
  constructor(TrackType: number, event: Event, selection: Selection, direction: number) {
    super(TrackType, event);

    const { anchorNode, anchorOffset, focusNode, focusOffset, isCollapsed, rangeCount } = selection;
    this.anchorNode = !anchorNode ? null : nodeMirror.getId(anchorNode as INode);
    this.anchorOffset = anchorOffset;
    this.focusNode = !focusNode ? null : nodeMirror.getId(focusNode as INode);
    this.focusOffset = focusOffset;
    this.isCollapsed = isCollapsed;
    this.rangeCount = rangeCount;
    this.direction = direction;
  }

  public readonly anchorNode: number | null;
  public readonly anchorOffset: number;
  public readonly focusNode: number | null;
  public readonly focusOffset: number;
  public readonly isCollapsed: boolean;
  public readonly rangeCount: number;
  public readonly direction: number;

}