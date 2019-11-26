import { getBehaviorRecords } from './getBehaviorRecords';
import { LoggerError } from '../logger/LoggerEvent/LoggerError';
import { TrackType } from '../enums/TrackType';
import { XHR } from '../utils/xhr/index';
import { BASEURL, REQUESTPATH } from '../constants/API';
import { HttpMethod } from '../enums/HttpMethod';
import { LoggerBasicInfo } from '../logger/LoggerBasicInfo';
import { EventLogger } from 'src/replay/types';
import { pageSize } from 'src/state/pageSize';
import { pageScroll } from 'src/state/pageScroll';

window.addEventListener('error', (error) => {
  getBehaviorRecords()
    .then((records: EventLogger[]) => {
      let resizeCount = 0;
      let scrollCount = 0;
      records.forEach((record) => {
        if (record.TrackType === TrackType.EVENT_RESIZE) {
          resizeCount++;
        }
        if (record.TrackType === TrackType.EVENT_SCROLL) {
          scrollCount++;
        }
      });
      const initialWindowSize = pageSize.getPageSizeBeforeResize(resizeCount);
      const initialScroll = pageScroll.getPageScrollPositionBeforeScroll(scrollCount);
      console.log('resizeCount: ', resizeCount);
      console.log('scrollCount: ', scrollCount);
      console.log('initialWindowSize: ', initialWindowSize);
      console.log('initialScroll: ', initialScroll);

      const errorTrackInfo = {
        info: new LoggerBasicInfo(),
        track: {
          error: new LoggerError(TrackType.ERROR, error),
          behaviors: records
        }
      };

      console.log('records within error happened 10s: ', JSON.stringify(errorTrackInfo));

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