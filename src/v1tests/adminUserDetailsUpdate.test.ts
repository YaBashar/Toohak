import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let token1: string;

// wrapper function
const updateDetails = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
    json: { token, email, nameFirst, nameLast }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const createUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
  token = user.body.token;
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/user/details', () => {
  // Email is currently used by another user (excluding the current authorised user)
  test('Email is already used by another user', () => {
    const authUser2 = createUser('steph@unsw.edu.au', 'Farmingsimulator!1234', 'steph', 'liang');
    token1 = authUser2.body.token;
    const res = updateDetails(token1, 'amelia@unsw.edu.au', 'amelia', 'su');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Email is not valid
  test('Email is not a valid email', () => {
    const res = updateDetails(token, 'gurigiurabgiurag', 'amelia', 'su');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // First/last name contains invalid characters
  test('First name contains invalid characters', () => {
    const res = updateDetails(token, 'amelia@unsw.ed.au', 'a!melia', 'su');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Last name contains invalid characters', () => {
    const res = updateDetails(token, 'amelia@unsw.ed.au', 'amelia', 'su+');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // First/last name is too short or too long
  test('First name is too short', () => {
    const res = updateDetails(token, 'amelia@unsw.ed.au', 'a', 'su');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('First name is too long', () => {
    const res = updateDetails(token, 'amelia@unsw.ed.au', 'abcdefghijklmnopqrstuv', 'su');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Last name is too short', () => {
    const res = updateDetails(token, 'amelia@unsw.ed.au', 'amelia', 's');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Last name is too long', () => {
    const res = updateDetails(token, 'amelia@unsw.ed.au', 'amelia', 'abcdefghijklmnopqrstuv');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // successful use of function
  test('function used correctly', () => {
    const res = updateDetails(token, 'amelia1@unsw.ed.au', 'ameliag', 'su');
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });
});
