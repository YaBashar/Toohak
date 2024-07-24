import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;

// wrapper functions
const createUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const updatePassword = (token: string, oldPassword: string, newPassword: string) => {
  return (request('PUT', SERVER_URL + '/v1/admin/user/password', {
    json: { token, oldPassword, newPassword }
  }));
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
  token = user.body.token;
});

describe('PUT /v1/admin/user/password', () => {
  // Old password is not correct
  test('Incorrect password', () => {
    const res = updatePassword(token, 'abcd1234!@#$ABC', 'newabcd1234!@#$ABCD');
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Old password and new password are the same
  test('Old password is the same as the new password', () => {
    const res = updatePassword(token, 'abcd1234!@#$ABCD', 'abcd1234!@#$ABCD');
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // New password has been used before
  test('New password has been used before', () => {
    const res = updatePassword(token, 'abcd1234!@#$ABCD', 'abcd1234!@#$ABC');
    expect(res.statusCode).toBe(200);
    const res2 = updatePassword(token, 'abcd1234!@#$ABC', 'abcd1234!@#$ABCD');
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toBe(400);
  });

  // New password is too short
  test('Invalid password length', () => {
    const res = updatePassword(token, 'abcd1234!@#$ABCD', 'abcd123');
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // New password doesn't contain at least on number and one letter
  test('Password does not contain at least one number and one letter', () => {
    const res = updatePassword(token, 'abcd1234!@#$ABCD', 'abcdefgh');
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
    const res2 = updatePassword(token, 'abcd1234!@#$ABCD', '12345678');
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toBe(400);
  });

  // Success case
  test('Success case', () => {
    const res = updatePassword(token, 'abcd1234!@#$ABCD', 'abcd1234!@#$ABC');
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });
});
