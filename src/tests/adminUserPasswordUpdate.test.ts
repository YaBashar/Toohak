import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su' } });
  token = JSON.parse(user.body.toString()).token;
});

describe('PUT /v1/admin/user/password', () => {
  // Old password is not correct
  test('Incorrect password', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABC', newPassword: 'newabcd1234!@#$ABCD' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'incorrect password' });
    expect(res.statusCode).toBe(400);
  });

  // Old password and new password are the same
  test('Old password is the same as the new password', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcd1234!@#$ABCD' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'new password is the same as old password' });
    expect(res.statusCode).toBe(400);
  });

  // New password has been used before
  test('New password has been used before', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcd1234!@#$ABC' } });
    expect(res.statusCode).toBe(200);
    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABC', newPassword: 'abcd1234!@#$ABCD' } });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: 'password has already been used' });
    expect(res2.statusCode).toBe(400);
  });

  // New password is too short
  test('Invalid password length', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcd123' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'password is too short' });
    expect(res.statusCode).toBe(400);
  });

  // New password doesn't contain at least on number and one letter
  test('Password does not contain at least one number and one letter', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcdefgh' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'new password should contain at least one letter and one number' });
    expect(res.statusCode).toBe(400);
    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABCD', newPassword: '12345678' } });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: 'new password should contain at least one letter and one number' });
    expect(res2.statusCode).toBe(400);
  });

  // Success case
  test('Success case', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcd1234!@#$ABC' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });
});
