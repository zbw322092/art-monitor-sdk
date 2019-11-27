import { Event } from '../../enums/EventName';
import { LoggerSelection } from '../../logger/LoggerEvent/LoggerSelection';
import { TrackType } from 'src/enums/TrackType';
import { throttle } from '../../utils/throttle';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from 'src/constants/DB';
import { detectSelectionDirection } from 'src/utils/detectSelectionDirection';

export function initSelectionListener() {
  document.addEventListener(Event.selectstart, (event) => {
    const selection = document.getSelection();
    if (selection) {
      const direction = detectSelectionDirection(selection);
      const selectionStartLog = new LoggerSelection(TrackType.EVENT_SELECTIONSTART, event, selection, direction);
      console.log('selection start log: ', selectionStartLog)
      iDBStoreInstance.set(OBJECTNAME, selectionStartLog)
        .then(() => {
          // console.log('scroll log added');
        })
        .catch((err) => {
          console.log('scroll log err: ', err);
        });
    }
  });

  document.addEventListener(Event.selectionchange, throttle((event) => {
    const selection = document.getSelection();
    if (selection) {
      const direction = detectSelectionDirection(selection);
      const selectionChangeLog = new LoggerSelection(TrackType.EVENT_SELECTIONCHANGE, event, selection, direction);
      console.log('selection change log: ', selectionChangeLog)
      iDBStoreInstance.set(OBJECTNAME, selectionChangeLog)
        .then(() => {
          // console.log('scroll log added');
        })
        .catch((err) => {
          console.log('scroll log err: ', err);
        });
    }
  }, 200));
}