import { xhrInterceptor } from './xhr-interceptor';
import { LoggerXHR } from '../logger/LoggerXHR';

xhrInterceptor.addResponseCallback((xhr) => {
  const xhrLogger = new LoggerXHR(xhr);
  console.log('xhrLogger: ', xhrLogger);
});

xhrInterceptor.wire();