import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su'}});
const id = JSON.parse(user.body.toString()).authUserId;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su'}});
  const id = JSON.parse(user.body.toString()).authUserId;
});

describe('PUT /v1/admin/user/details', () => {
  test('User Id is not valid', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: 'hello', email: 'amelia1@unsw.edu.au', nameFirst: 'amelia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid userId' });
  });

  // Email is currently used by another user (excluding the current authorised user)
  test('Email is already used by another user', () => {
    const authUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'steph@unsw.edu.au', password: 'Farmingsimulator!1234', nameFirst: 'steph', nameLast: 'liang'}});
    const authUserId2 = JSON.parse(authUser2.body.toString()).authUserId;
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: authUserId2, email: 'amelia@unsw.edu.au', nameFirst: 'amelia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'email used by another user' });
  });

  // Email is not valid
  test('Email is not a valid email', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'gurigiurabgiurag', nameFirst: 'amelia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid email address' });
  });

  // First/last name contains invalid characters
  test('First name contains invalid characters', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'amelia@unsw.ed.au', nameFirst: 'a!melia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'first name contains invalid characters' });
  });

  test('Last name contains invalid characters', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'amelia@unsw.ed.au', nameFirst: 'amelia', nameLast: 'su+' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'last name contains invalid characters' });
  });

  // First/last name is too short or too long
  test('First name is too short', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'amelia@unsw.ed.au', nameFirst: 'a', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'first name is too short' });
  });

  test('First name is too long', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'amelia@unsw.ed.au', nameFirst: 'abcdefghijklmnopqrstuv', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'first name is too long'});
  });

  test('Last name is too short', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'amelia@unsw.ed.au', nameFirst: 'amelia', nameLast: 's' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'last name is too short' });
  });

  test('Last name is too long', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'amelia@unsw.ed.au', nameFirst: 'amelia', nameLast: 'abcdefghijklmnopqrstuv' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'last name is too long' });
  });

  // successful use of function
  test('function used correctly', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId: id, email: 'amelia1@unsw.ed.au', nameFirst: 'amelia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });
});