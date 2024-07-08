import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su'}});
let token: string;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su'}});
  token = JSON.parse(user.body.toString()).token;
});

describe('PUT /v1/admin/user/details', () => {
  // Email is currently used by another user (excluding the current authorised user)
  test('Email is already used by another user', () => {
    const authUser2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'steph@unsw.edu.au', password: 'Farmingsimulator!1234', nameFirst: 'steph', nameLast: 'liang'}});
    const authUserId2 = JSON.parse(authUser2.body.toString()).authUserId;
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { authUserId2, email: 'amelia@unsw.edu.au', nameFirst: 'amelia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'email used by another user' });
  });

  // Email is not valid
  test('Email is not a valid email', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'gurigiurabgiurag', nameFirst: 'amelia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid email address' });
  });

  // First/last name contains invalid characters
  test('First name contains invalid characters', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'amelia@unsw.ed.au', nameFirst: 'a!melia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'first name contains invalid characters' });
  });

  test('Last name contains invalid characters', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'amelia@unsw.ed.au', nameFirst: 'amelia', nameLast: 'su+' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'last name contains invalid characters' });
  });

  // First/last name is too short or too long
  test('First name is too short', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'amelia@unsw.ed.au', nameFirst: 'a', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'first name is too short' });
  });

  test('First name is too long', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'amelia@unsw.ed.au', nameFirst: 'abcdefghijklmnopqrstuv', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'first name is too long'});
  });

  test('Last name is too short', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'amelia@unsw.ed.au', nameFirst: 'amelia', nameLast: 's' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'last name is too short' });
  });

  test('Last name is too long', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'amelia@unsw.ed.au', nameFirst: 'amelia', nameLast: 'abcdefghijklmnopqrstuv' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'last name is too long' });
  });

  // successful use of function
  test('function used correctly', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email: 'amelia1@unsw.ed.au', nameFirst: 'amelia', nameLast: 'su' }});
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });
});