import { LoggerUIEvent } from '../../logger/LoggerUIEvent/LoggerUIEvent';
import { TrackType } from '../../enums/TrackType';
import { iDBStoreInstance } from '../../data-store/IDBStore';
import { OBJECTNAME } from '../../constants/DB';
import { UIEvent } from '../../enums/EventName';

window.addEventListener(UIEvent.select, (event) => {
  const loggerUIEvent = new LoggerUIEvent(TrackType.UIEVENT_SELECT, event as any);
  console.log('Log Select: ', loggerUIEvent);

  iDBStoreInstance.set(OBJECTNAME, loggerUIEvent)
    .then(() => {
      // TODO store selection value properly within log
      // @ts-ignore
      const selection = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);
      console.log('selection: ', selection);
      // console.log('touch log added');
    })
    .catch((err) => {
      console.log('touch log err: ', err);
    });
});