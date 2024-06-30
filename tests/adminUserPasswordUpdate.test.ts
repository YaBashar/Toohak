import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su'}});
const id = JSON.parse(user.body.toString()).authUserId;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su'}});
  id = JSON.parse(user.body.toString()).authUserId;
});

describe('PUT /v1/admin/user/password', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: 'randomstring', oldPassword: 'abcd1234!@#$ABCD', newPassword: 'newabcd1234!@#$ABCD' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid userId' });

    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: '1', oldPassword: 'abcd1234!@#$ABCD', newPassword: 'newabcd1234!@#$ABCD' } });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: 'invalid userId' });
  });

  // Old password is not correct
  test('Incorrect password', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: id, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'newabcd1234!@#$ABCD' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'incorrect password' });
  });

  // Old password and new password are the same
  test('Old password is the same as the new password', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: id, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcd1234!@#$ABCD' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'new password is the same as old password' });
  });

  // New password has been used before
  test('New password has been used before', () => {
    const res1 = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: id, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcd1234!@#$ABC' } });
    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: id, oldPassword: 'abcd1234!@#$ABC', newPassword: 'abcd1234!@#$ABCD' } });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: 'password has already been used' });
  });

  // New password is too short
  test('Invalid password length', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: id, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcd123' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'password is too short' });
  });

  // New password doesn't contain at least on number and one letter
  test('Password does not contain at least one number and one letter', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: id, oldPassword: 'abcd1234!@#$ABCD', newPassword: 'abcdefgh' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'new password should contain at least one letter and one number'});
    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { authUserId: id, oldPassword: 'abcd1234!@#$ABCD', newPassword: '12345678' } });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: 'new password should contain at least one letter and one number'});
  });
});