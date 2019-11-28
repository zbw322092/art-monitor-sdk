import { LoggerError } from '../logger/LoggerEvent/LoggerError';
import { LoggerEvent } from '../logger/LoggerEvent/LoggerEvent';
import { LoggerNetwork } from '../logger/LoggerEvent/LoggerNetwork';
import { LoggerMutation } from '../logger/LoggerMutation/LoggerMutation';
import { LoggerFocusEvent } from '../logger/LoggerUIEvent/LoggerFocusEvent';
import { LoggerKeyboardEvent } from '../logger/LoggerUIEvent/LoggerKeyboardEvent';
import { LoggerMouseEvent } from '../logger/LoggerUIEvent/LoggerMouseEvent';
import { LoggerPointerEvent } from '../logger/LoggerUIEvent/LoggerPointerEvent';
import { LoggerTouchEvent } from '../logger/LoggerUIEvent/LoggerTouchEvent';
import { LoggerUIEvent } from '../logger/LoggerUIEvent/LoggerUIEvent';
import { LoggerStateChangeEvent } from '../logger/LoggerStateChangeEvent';
import { LoggerXHR } from '../logger/LoggerXHR';
import { serializedNodeWithId } from '../snapshot/types';
import { LoggerResizeEvent } from '../logger/LoggerUIEvent/LoggerResizeEvent';
import { LoggerScrollEvent } from '../logger/LoggerEvent/LoggerScroll';
import { LoggerSelection } from '../logger/LoggerEvent/LoggerSelection';
import { LoggerInputEvent } from '../logger/LoggerUIEvent/LoggerInputEvent';

export type ReplayData = {
  data: {
    node: serializedNodeWithId | null,
    initialScroll: { x: number, y: number },
    initialWindowSize: { width: number, height: number }
  },
  logs: EventLogger[]
};

export type EventLogger = LoggerError | LoggerEvent | LoggerNetwork | LoggerMutation |
  LoggerFocusEvent | LoggerKeyboardEvent | LoggerMouseEvent | LoggerPointerEvent |
  LoggerTouchEvent | LoggerUIEvent | LoggerResizeEvent | LoggerScrollEvent | LoggerStateChangeEvent |
  LoggerXHR | LoggerSelection | LoggerInputEvent;

export type PlayerConfig = {
  speed: number;
  initialDelay: number;
  root: Element;
  loadTimeout: number;
  skipInactive: boolean;
  showWarning: boolean;
  showDebug: boolean;
  blockClass: string;
  liveMode: boolean;
  insertStyleRules: string[];
};

export type Actions = {
  action: () => void;
  delay: number;
}