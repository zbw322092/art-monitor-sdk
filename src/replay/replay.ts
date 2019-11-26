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

    this.initReplayPanel();
    this.initVirtualMouse();
  }

  private wrapper: HTMLDivElement;
  private iframe: HTMLIFrameElement;
  private initReplayPanel() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('replayer-wrapper');
    this.config.root.appendChild(this.wrapper);

    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('sandbox', 'allow-same-origin');
    this.iframe.setAttribute('scrolling', 'yes');
    this.iframe.setAttribute('style', 'pointer-events: none');
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
      default:
        break;
    }

    return action;
  }
}