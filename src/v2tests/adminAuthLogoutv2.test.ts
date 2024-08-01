import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  token = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Testing logout error cases', () => {
  test('Invalid token', () => {
    const res = requestAuthLogout('invalid token');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Testing logout success case', () => {
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

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Logout only removes intended session', () => {
    const token2 = requestAuthRegister('zid1@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
    const token3 = requestAuthRegister('zid2@ad.unsw.edu.au', 'abcd1234', 'first', 'last');

    requestAuthLogout(token2);

    const res1 = requestUserDetails(token);
    const res2 = requestUserDetails(token2);
    const res3 = requestUserDetails(token3);

    expect(res1.statusCode).not.toStrictEqual(401);
    expect(res2.statusCode).toStrictEqual(401);
    expect(res3.statusCode).not.toStrictEqual(401);
  });
});

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string): string => {
  const token = (request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  }));

  return JSON.parse(token.body.toString()).token;
};

const requestAuthLogout = (token: string) => {
  return (request('POST', SERVER_URL + '/v2/admin/auth/logout', {
    headers: { token }, timeout: TIMEOUT_MS
  }));
};

const requestUserDetails = (token: string) => {
  return (request('GET', SERVER_URL + '/v1/admin/user/details', {
    qs: { token }, timeout: TIMEOUT_MS
  }));
};
