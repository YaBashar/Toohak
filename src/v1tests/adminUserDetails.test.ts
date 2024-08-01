import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  const user = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  token = JSON.parse(user.body.toString()).token;
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Testing error cases', () => {
  test('Invalid token', () => {
    const res = requestUserDetails('invalid token');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
  // Userid does not exist
  test('Invalid userId', () => {
    const res = requestUserDetails('0');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Testing correct return', () => {
  test('Returns correct object', () => {
    const res = requestUserDetails(token);
    const data = JSON.parse(res.body.toString());

    const exp = {
      user: {
        userId: expect.any(Number),
        name: 'first last',
        email: 'zid@ad.unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
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
    qs: { token }, timeout: TIMEOUT_MS
  }));
};
