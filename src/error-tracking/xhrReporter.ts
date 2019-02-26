import { XHR } from '../utils/xhr';
import { HttpMethod } from '../enums/HttpMethod';

XHR(
  'https://aws.random.cat/meow',
  {
    method: HttpMethod.GET
  },
  (err, response, body) => {
    if (err) {
      console.log('err: ', err);
      return;
    }
    console.log('response: ', response);
    console.log('body: ', body);
  }
);