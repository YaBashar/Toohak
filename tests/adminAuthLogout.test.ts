import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Testing logout error cases', () => {
  test('Invalid token', () => {
    requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');

    const res = requestAuthLogout('invalid token');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: 'invalid token' });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Testing logout success case', () => {
  let token: string;

  beforeEach(() => {
    const user = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
    token = JSON.parse(user.body.toString()).token;
  });

  test('Correct return object', () => {
    const res = requestAuthLogout(token);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Successfully removes sessionId', () => {
    requestAuthLogout(token);

    const res = requestUserDetails(token);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: 'invalid token' });
    expect(res.statusCode).toStrictEqual(401);
  });
});

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  }));
};

const requestAuthLogout = (token: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/logout', {
    json: { token }, timeout: TIMEOUT_MS
  }));
};

const requestUserDetails = (token: string) => {
  return (request('GET', SERVER_URL + '/v1/admin/user/details', {
    json: { token }, timeout: TIMEOUT_MS
  }));
};
