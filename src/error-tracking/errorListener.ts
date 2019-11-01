import { getBehaviorRecords } from './getBehaviorRecords';
import { LoggerError } from '../logger/LoggerEvent/LoggerError';
import { TrackType } from '../enums/TrackType';
import { XHR } from '../utils/xhr/index';
import { BASEURL, REQUESTPATH } from '../constants/API';
import { HttpMethod } from '../enums/HttpMethod';
import { LoggerBasicInfo } from '../logger/LoggerBasicInfo';

window.addEventListener('error', (error) => {
  getBehaviorRecords()
    .then((records) => {
      console.log('records within error happened 10s: ', records);

      const errorTrackInfo = {
        info: new LoggerBasicInfo(),
        track: {
          error: new LoggerError(TrackType.ERROR, error),
          behaviors: records
        }
      };

      XHR(
        BASEURL + REQUESTPATH,
        {
          method: HttpMethod.POST,
          body: JSON.stringify(errorTrackInfo)
        },
        (err, response) => {
          if (err) {
            console.log('error report error: ', err);
            return;
          }
          console.log('error report response: ', response);
        }
      );

    })
    .catch((err) => {
      console.log(`get record has err: `, err);
    });
});