import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});


describe('Testing error cases', () => {

  test('Invalid token', () => {
    
  });

})


describe('Testing side effects', () => {
  

})


const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
    return (request('POST', SERVER_URL + '/v1/admin/auth/register', {
      json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
    }));
  };