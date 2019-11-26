import { LoggerUIEvent } from './LoggerUIEvent';
import { nodeMirror } from 'src/state/nodeMirror';
import { INode } from 'src/snapshot/types';
// import { getEventTargetInfo } from '../getEventTargetInfo';

export class LoggerMouseEvent extends LoggerUIEvent {
  constructor(TrackType: number, mouseEvent: MouseEvent) {
    super(TrackType, mouseEvent);

    this.altKey = mouseEvent.altKey;
    this.button = mouseEvent.button;
    this.buttons = mouseEvent.buttons;
    this.clientX = mouseEvent.clientX;
    this.clientY = mouseEvent.clientY;
    this.ctrlKey = mouseEvent.ctrlKey;
    this.metaKey = mouseEvent.metaKey;
    this.movementX = mouseEvent.movementX;
    this.movementY = mouseEvent.movementY;
    this.offsetX = mouseEvent.offsetX;
    this.offsetY = mouseEvent.offsetY;
    this.pageX = mouseEvent.pageX;
    this.pageY = mouseEvent.pageY;
    // this.relatedTarget = getEventTargetInfo(mouseEvent.relatedTarget);
    this.relatedTarget = mouseEvent.relatedTarget ? nodeMirror.getId(mouseEvent.relatedTarget as INode) : null;
    this.screenX = mouseEvent.screenX;
    this.screenY = mouseEvent.screenY;
    this.shiftKey = mouseEvent.shiftKey;
  }

  public readonly altKey: boolean;
  public readonly button: number;
  public readonly buttons: number;
  public readonly clientX: number;
  public readonly clientY: number;
  public readonly ctrlKey: boolean;
  public readonly metaKey: boolean;
  public readonly movementX: number;
  public readonly movementY: number;
  public readonly offsetX: number;
  public readonly offsetY: number;
  public readonly pageX: number;
  public readonly pageY: number;
  // public readonly relatedTarget: string | null;
  public readonly relatedTarget: number | null;
  public readonly screenX: number;
  public readonly screenY: number;
  public readonly shiftKey: boolean;

}