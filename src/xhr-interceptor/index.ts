import { xhrInterceptor } from './xhr-interceptor';
import { LoggerXHR } from '../logger/LoggerXHR';
import { TRACKTYPE } from '../constants/TRACKTYPE';

xhrInterceptor.addResponseCallback((xhr) => {
  const xhrLogger = new LoggerXHR(TRACKTYPE.XHRINTERCEPT, xhr);
  console.log('xhrLogger: ', xhrLogger);
});

xhrInterceptor.wire();