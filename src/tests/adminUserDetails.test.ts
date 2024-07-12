import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Testing error cases', () => {
  test('Invalid token', () => {
    requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
    const res = requestUserDetails('invalid token');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Testing correct return', () => {
  let token: string;

  beforeEach(() => {
    const user = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
    token = JSON.parse(user.body.toString()).token;
  });

  test('Returns correct object', () => {
    const res = requestUserDetails(token);
    const data = JSON.parse(res.body.toString());

    const exp = {
      user: {
        authUserId: expect.any(Number),
        name: 'first last',
        email: 'zid@ad.unsw.edu.au',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordSinceLastLogin: expect.any(Number),
      }
    };

    expect(data).toStrictEqual(exp);
    expect(res.statusCode).toStrictEqual(200);
  });
});

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  }));
};

const requestUserDetails = (token: string) => {
  return (request('GET', SERVER_URL + '/v1/admin/user/details', {
    json: { token }, timeout: TIMEOUT_MS
  }));
};
