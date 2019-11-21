import { EventLogger, PlayerConfig, ReplayData } from './types';
import { TrackType } from '../enums/TrackType';
import rebuild from '../snapshot/rebuild';
import { LoggerResizeEvent } from '../logger/LoggerUIEvent/LoggerResizeEvent';
import { LoggerScrollEvent } from 'src/logger/LoggerEvent/LoggerScroll';

export default class Replay {
  private config: PlayerConfig;
  private replayData: ReplayData;
  constructor(replayData: ReplayData, config?: Partial<PlayerConfig>) {
    this.replayData = replayData;

    const defaultConfig: PlayerConfig = {
      speed: 1,
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
  }

  private wrapper: HTMLDivElement;
  private mouse: HTMLDivElement;
  private iframe: HTMLIFrameElement;
  private initReplayPanel() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('replayer-wrapper');
    this.config.root.appendChild(this.wrapper);

    this.mouse = document.createElement('div');
    this.mouse.classList.add('replayer-mouse');
    this.wrapper.appendChild(this.mouse);

    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('sandbox', 'allow-same-origin');
    this.iframe.setAttribute('scrolling', 'yes');
    this.iframe.setAttribute('style', 'pointer-events: none');
    this.wrapper.appendChild(this.iframe);

    const { node, initialScroll, initialWindowSize } = this.replayData.data;
    rebuild(node!, this.iframe.contentDocument!);

    this.iframe.width = `${initialWindowSize.width}px`;
    this.iframe.height = `${initialWindowSize.height}px`;

    this.iframe.contentWindow!.scrollTo(initialScroll.x, initialScroll.y);
  }

  public play() {
    this.trackLogHandler(this.replayData.logs);
  }

  private trackLogHandler(logs: EventLogger[]) {
    logs.forEach((log) => {
      switch (log.TrackType) {
        case TrackType.EVENT_RESIZE:
          console.log(111);
          console.log(`${(log as LoggerResizeEvent).width}px, `, `${(log as LoggerResizeEvent).height}px`);
          this.iframe.width = `${(log as LoggerResizeEvent).width}px`;
          this.iframe.height = `${(log as LoggerResizeEvent).height}px`;
          break;
        case TrackType.EVENT_SCROLL:
          console.log(222);
          console.log((log as LoggerScrollEvent).scrollY);
          this.iframe.contentWindow!.scrollTo(
            (log as LoggerScrollEvent).scrollX,
            (log as LoggerScrollEvent).scrollY
          )
        default:
          break;
      }
    });
  }
}