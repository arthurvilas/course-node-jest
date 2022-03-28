import { IncomingMessage } from 'http';
import { Utils } from '../../app/Utils/Utils';

describe('Utils test suite', () => {
  test('getRequestBasePath with valid request', () => {
    // const validUrl = 'http://localhost:8080/login';
    // const resultPath = Utils.getRequestBasePath(validUrl); ERROR - method expects IncomingMessage type

    const request = {
      url: 'http://localhost:8080/login', // property we care about
    } as IncomingMessage; // type casted for parameter type

    const resultPath = Utils.getRequestBasePath(request);
    expect(resultPath).toBe('login');
  });

  test('getRequestBasePath with no path name', () => {
    const request = {
      url: 'http://localhost:8080/',
    } as IncomingMessage;

    const resultPath = Utils.getRequestBasePath(request);
    expect(resultPath).toBeFalsy();
  });

  test('getRequestBasePath with no url', () => {
    const request = {
      url: '',
    } as IncomingMessage;

    const resultPath = Utils.getRequestBasePath(request);
    expect(resultPath).toBeFalsy();
  });
});
