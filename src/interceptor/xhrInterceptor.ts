import { xhrInterceptor } from '../utils/xhr-interceptor/xhr-interceptor';
import { LoggerXHR } from '../logger/LoggerXHR';
import { TrackType } from '../enums/TrackType';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

xhrInterceptor.addResponseCallback((xhr) => {
  const xhrLogger = new LoggerXHR(TrackType.XHRINTERCEPT, xhr);
  console.log('xhr log: ', xhrLogger);

  iDBStoreInstance.set(OBJECTNAME, xhrLogger)
    .then(() => {
      console.log('xhr log added');
    })
    .catch((err) => {
      console.log('xhr log err: ', err);
    });
});

xhrInterceptor.wire();