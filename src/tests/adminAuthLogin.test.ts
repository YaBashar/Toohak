import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let uid: string;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  uid = requestAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
});

describe('Testing login error cases', () => {
  // Email address does not exist.
  test('Email address does not exist', () => {
    const res = requestAuthLogin('zid2@unsw.edu.au', 'abcd1234');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  // Password is not correct for the given email.
  test('Incorrect password', () => {
    const res = requestAuthLogin('zid@unsw.edu.au', 'abcd123');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Testing login success cases', () => {
  // Successful Login return type
  test('Successful login return type', () => {
    const res = requestAuthLogin('zid@unsw.edu.au', 'abcd1234');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ token: expect.any(String) });
    expect(res.statusCode).toStrictEqual(200);
  });

  // updating the successful login count
  test('Correctly updates login count', () => {
    requestAuthLogin('zid@unsw.edu.au', 'abcd1234');
    requestAuthLogin('zid@unsw.edu.au', 'abcd1234');

    expect(requestUserDetails(uid)).toStrictEqual({
      user: {
        authUserId: expect.any(Number),
        name: 'first last',
        email: 'zid@unsw.edu.au',
        numSuccessfulLogins: 3,
        numFailedPasswordSinceLastLogin: 0,
      }
    });
  });

  // updating the number of failed logins count
  test('Correctly updates unsuccessful login count', () => {
    requestAuthLogin('zid@unsw.edu.au', 'incorrect password');
    requestAuthLogin('zid@unsw.edu.au', 'incorrect password');
    requestAuthLogin('zid@unsw.edu.au', 'incorrect password');

    expect(requestUserDetails(uid)).toStrictEqual({
      user: {
        authUserId: expect.any(Number),
        name: 'first last',
        email: 'zid@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordSinceLastLogin: 3,
      }
    });
  });

  // resetting unsuccessful login count after successful login
  test('Correclty resets unsuccessful login counter', () => {
    requestAuthLogin('zid@unsw.edu.au', 'incorrect password');
    requestAuthLogin('zid@unsw.edu.au', 'incorrect password');
    requestAuthLogin('zid@unsw.edu.au', 'abcd1234');

    expect(requestUserDetails(uid)).toStrictEqual({
      user: {
        authUserId: expect.any(Number),
        name: 'first last',
        email: 'zid@unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordSinceLastLogin: 0,
      }
    });
  });
});

// HELPER FUNCTIONS
const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const uid = (request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  }));
  return JSON.parse(uid.body.toString()).token;
};

const requestAuthLogin = (email: string, password: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password }, timeout: TIMEOUT_MS
  }));
};

const requestUserDetails = (token: string) => {
  const details = (request('GET', SERVER_URL + '/v1/admin/user/details', {
    qs: { token }, timeout: TIMEOUT_MS
  }));

  return JSON.parse(details.body.toString());
};
