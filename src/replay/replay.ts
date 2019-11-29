import { EventLogger, PlayerConfig, ReplayData, Actions } from './types';
import { TrackType } from '../enums/TrackType';
import rebuild, { buildNodeWithSerializedNode } from '../snapshot/rebuild';
import { LoggerResizeEvent } from '../logger/LoggerUIEvent/LoggerResizeEvent';
import { LoggerScrollEvent } from 'src/logger/LoggerEvent/LoggerScroll';
import { LoggerMutation, MutationType } from '../logger/LoggerMutation/LoggerMutation';
import { nodeMirror } from './utils';
import { serializedNodeWithId } from '../snapshot/types';
import { Timer } from './timer';
import { VirtualMouse } from './virtualMouse';
import { LoggerMouseEvent } from 'src/logger/LoggerUIEvent/LoggerMouseEvent';
import { LoggerSelection } from 'src/logger/LoggerEvent/LoggerSelection';
import { SelectionDirection } from 'src/enums/SelectionDirection';
import { LoggerInputEvent } from 'src/logger/LoggerUIEvent/LoggerInputEvent';
import { LoggerStateChangeEvent } from 'src/logger/LoggerStateChangeEvent';

export type InputableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const MASKMARK = '*';

export default class Replay {
  private config: PlayerConfig;
  private replayData: ReplayData;
  constructor(replayData: ReplayData, config?: Partial<PlayerConfig>) {
    this.replayData = replayData;

    const defaultConfig: PlayerConfig = {
      speed: 1,
      initialDelay: 1000,
      root: document.body,
      loadTimeout: 0,
      skipInactive: false,
      showWarning: true,
      showDebug: false,
      blockClass: 'art-block',
      liveMode: false,
      insertStyleRules: []
    };
    this.config = Object.assign({}, defaultConfig, config);

    this.pageStateElement = document.querySelector('.page-state');
    this.initReplayPanel();
    this.initVirtualMouse();
  }

  private pageStateElement: HTMLDivElement | null;
  private wrapper: HTMLDivElement;
  private iframe: HTMLIFrameElement;
  private initReplayPanel() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('replayer-wrapper');
    this.config.root.appendChild(this.wrapper);

    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('sandbox', 'allow-same-origin');
    this.iframe.setAttribute('scrolling', 'yes');
    this.iframe.setAttribute('style', 'pointer-events: none;');
    this.wrapper.appendChild(this.iframe);

    this.buildInitialPage();
  }

  private virtualMouse: VirtualMouse;
  private initVirtualMouse() {
    this.virtualMouse = new VirtualMouse(this.wrapper);
  }

  private buildInitialPage() {
    const { node, initialScroll, initialWindowSize } = this.replayData.data;
    nodeMirror.map = rebuild(node!, this.iframe.contentDocument!)[1];

    this.iframe.width = `${initialWindowSize.width}px`;
    this.iframe.height = `${initialWindowSize.height}px`;

    this.iframe.contentWindow!.scrollTo(initialScroll.x, initialScroll.y);
  }

  public play() {
    const actions = this.trackLogHandler(this.replayData.logs);
    const timer = new Timer(this.config, actions);
    timer.start();
  }

  private getDelay(log: EventLogger) {
    const firstLogTimestamp = this.replayData.logs[0] && this.replayData.logs[0].timestamp;
    return log.timestamp - firstLogTimestamp + this.config.initialDelay;
  }

  private trackLogHandler(logs: EventLogger[]): Actions[] {
    const actions: Actions[] = [];
    logs.forEach((log) => {
      let action: () => any = () => { };
      switch (log.TrackType) {
        case TrackType.EVENT_RESIZE:
          action = () => {
            console.log(`${(log as LoggerResizeEvent).width}px, `, `${(log as LoggerResizeEvent).height}px`);
            this.iframe.width = `${(log as LoggerResizeEvent).width}px`;
            this.iframe.height = `${(log as LoggerResizeEvent).height}px`;
          };
          break;
        case TrackType.EVENT_SCROLL:
          action = () => {
            console.log('scroll');
            this.iframe.contentWindow!.scrollTo(
              (log as LoggerScrollEvent).scrollX,
              (log as LoggerScrollEvent).scrollY
            );
          }
          break;
        case TrackType.MUTATION:
          action = this.replayMutation(log as LoggerMutation);
          break;
        case TrackType.MOUSEEVENT_CLICK:
          action = () => {
            this.virtualMouse.updatePosition(
              (log as LoggerMouseEvent).clientX,
              (log as LoggerMouseEvent).clientY
            );

            this.virtualMouse.virtualClick();
          };
          break;
        case TrackType.EVENT_SELECTIONSTART:
        case TrackType.EVENT_SELECTIONCHANGE:
          action = this.replaySelection(log as LoggerSelection);
          break;
        case TrackType.INPUTEVENT_INPUT:
          action = this.replayInput(log as LoggerInputEvent);
          break;
        case TrackType.STATECHANGE:
          action = this.replayPageStateChange(log as LoggerStateChangeEvent);
          break;
        default:
          break;
      }
      actions.push({
        action,
        delay: this.getDelay(log)
      });
    });
    return actions;
  }

  private replayMutation(log: LoggerMutation) {

    const { mutationType, addedNodes, removedNodes, nextSibling, newValue, attributeName } = log;
    let action: () => any = () => { };
    switch (mutationType) {
      case MutationType.characterData:
        action = () => {
          console.log('characterData');
          const characterTargetNode = nodeMirror.getNode(log.target as number);
          characterTargetNode!.textContent = log.newValue;
        }
        break;
      case MutationType.attributes:
        action = () => {
          console.log('attributes');
          const attributesTargetNode = nodeMirror.getNode(log.target as number);
          // TODO handle null target situation
          if (!attributesTargetNode) { return; }
          if (newValue === null) {
            (attributesTargetNode as Node as Element).removeAttribute(attributeName as string);
          } else {
            (attributesTargetNode as Node as Element).setAttribute(
              attributeName as string,
              newValue
            );
          }
        }
        break;
      case MutationType.childList:
        action = () => {
          console.log('childList');
          const childListTargetNode = nodeMirror.getNode(log.target as number);
          const nextSiblingNode = nextSibling === null ? null : nodeMirror.getNode(nextSibling as number)
          const builtAddedNodes = addedNodes.map((node) => {
            return buildNodeWithSerializedNode(
              node as serializedNodeWithId,
              this.iframe.contentDocument!,
              nodeMirror.map
            );
          });
          builtAddedNodes.forEach((node) => {
            if (nextSiblingNode) {
              childListTargetNode!.insertBefore(node!, nextSiblingNode);
            } else {
              childListTargetNode!.appendChild(node!);
            }
          });

          removedNodes.forEach((node) => {
            const removedNode = nodeMirror.getNode(node as number);
            if (!removedNode) { return; }
            nodeMirror.removeNodeFromMap(removedNode!);
            childListTargetNode!.removeChild(removedNode!);
          });
        }
        break;
      default:
        break;
    }

    return action;
  }

  private replaySelection(log: LoggerSelection): () => any {
    const ancherNode = log.anchorNode === null ? null : nodeMirror.getNode(log.anchorNode);
    const focusNode = log.focusNode === null ? null : nodeMirror.getNode(log.focusNode);
    if (!ancherNode || !focusNode ||
      !this.iframe.contentDocument ||
      !this.iframe.contentDocument.getSelection) { return () => {}; }
    return () => {
      console.log('range');
      const { anchorOffset, focusOffset, direction } = log;
      const range = new Range();
      const cursorPosition = { x: 0, y: 0 };
      if (direction === SelectionDirection.forward) {
        range.setStart(ancherNode, anchorOffset);
        range.setEnd(focusNode, focusOffset);

        const clientRects = range.getClientRects();
        const lastRect = clientRects[clientRects.length - 1];
        cursorPosition.x = lastRect.left + lastRect.width;
        cursorPosition.y = lastRect.top;
      } else if (direction === SelectionDirection.backward) {
        range.setStart(focusNode, focusOffset);
        range.setEnd(ancherNode, anchorOffset);

        const firstRect = range.getClientRects()[0];
        cursorPosition.x = (firstRect as DOMRect).x;
        cursorPosition.y = (firstRect as DOMRect).y;
      } else if (direction === SelectionDirection.collapsed) {
        return;
      }
      this.iframe.contentDocument!.getSelection()!.removeAllRanges();
      this.virtualMouse.updatePosition(cursorPosition.x, cursorPosition.y);
      this.iframe.contentDocument!.getSelection()!.addRange(range);
    };
  }

  private checkInputElementType(element: Node, type: string | string[]): boolean {
    return Object.prototype.toString.call(element) === '[object HTMLInputElement]' &&
    (
      typeof type === 'string' ?
      ((element as Node) as HTMLInputElement).type === type :
      type.includes(((element as Node) as HTMLInputElement).type)
    );
  }

  private replayInput(log: LoggerInputEvent): () => any {
    const { target, isMasked, inputTargetValue, inputTargetValueLength } = log;
    if (target === null) { return () => {}; }
    const inputTarget = nodeMirror.getNode(target);
    if (inputTarget === null) { return () => {}; }
    if (isMasked) {
      return () => {
        ((inputTarget as Node) as InputableElement).value = MASKMARK.repeat(inputTargetValueLength as number);
      };
    } else {
      const partialInputElementTypes = ['color', 'date', 'datetime-local', 'email', 'image', 'month', 'number', 'password',
      'range', 'search', 'tel', 'text', 'time', 'url', 'week'];
      return () => {
        if (this.checkInputElementType(inputTarget, 'radio')) {
          ((inputTarget as Node) as HTMLInputElement).checked = true;
        } else if (this.checkInputElementType(inputTarget, 'checkbox')) {
          ((inputTarget as Node) as HTMLInputElement).checked = !((inputTarget as Node) as HTMLInputElement).checked;
        } else if (
          this.checkInputElementType(inputTarget, partialInputElementTypes) ||
          Object.prototype.toString.call(inputTarget) === '[object HTMLSelectElement]' ||
          Object.prototype.toString.call(inputTarget) === '[object HTMLTextAreaElement]'
        ) {
          ((inputTarget as Node) as HTMLInputElement).value = inputTargetValue || '';
        } else if (this.checkInputElementType(inputTarget, 'file')) {
          // TODO handle file input type properly
          console.log('add file: ', inputTargetValue);
        }
      };
    }
  }

  private replayPageStateChange(log: LoggerStateChangeEvent): () => any {
    const { prevState, newState } = log;
    console.log('this.pageStateElement: ', this.pageStateElement);
    if (this.pageStateElement === null) { return () => {}; }

    const currentStateElement = this.pageStateElement.querySelector(`.${newState}`);
    if (currentStateElement === null) { return () => {}; }
    const previousStateElement = this.pageStateElement.querySelector(`.${prevState}`);
    return () => {
      console.log('replayPageStateChange');
      currentStateElement.classList.add('current-active');
      if (previousStateElement) {
        previousStateElement.classList.remove('current-active');
      }
    }
  }
}