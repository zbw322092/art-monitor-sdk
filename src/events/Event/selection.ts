import { Event as EventName } from '../../enums/EventName';
import { LoggerSelection } from '../../logger/LoggerEvent/LoggerSelection';
import { TrackType } from 'src/enums/TrackType';
import { throttle } from '../../utils/throttle';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from 'src/constants/DB';
import { detectSelectionDirection } from 'src/utils/detectSelectionDirection';

function isInputSelection(): boolean {
  const activeElement = document.activeElement;
  return activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
}

export function initSelectionListener() {
  document.addEventListener(EventName.selectstart, (event) => {
    const selection = document.getSelection();
    if (selection === null) { return; }

    if (isInputSelection()) { return; }

    const direction = detectSelectionDirection(selection);
    const selectionStartLog = new LoggerSelection(TrackType.EVENT_SELECTIONSTART, event, selection, direction);
    console.log('selection start log: ', selectionStartLog)
    iDBStoreInstance.set(OBJECTNAME, selectionStartLog)
      .then(() => {
      })
      .catch((err) => {
        console.log('scroll log err: ', err);
      });
  });

  document.addEventListener(EventName.selectionchange, throttle((event) => {
    const selection = document.getSelection();
    if (selection === null) { return; }

    if (isInputSelection()) { return; }

    const direction = detectSelectionDirection(selection);
    const selectionChangeLog = new LoggerSelection(TrackType.EVENT_SELECTIONCHANGE, event, selection, direction);
    console.log('selection change log: ', selectionChangeLog)
    iDBStoreInstance.set(OBJECTNAME, selectionChangeLog)
      .then(() => {
      })
      .catch((err) => {
        console.log('scroll log err: ', err);
      });
  }, 200));
}