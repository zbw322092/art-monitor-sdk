import { xhrInterceptor } from './xhr-interceptor';
import { LoggerXHR } from '../logger/LoggerXHR';
import { TRACKTYPE } from '../constants/TRACKTYPE';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

xhrInterceptor.addResponseCallback((xhr) => {
  const xhrLogger = new LoggerXHR(TRACKTYPE.XHRINTERCEPT, xhr);
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