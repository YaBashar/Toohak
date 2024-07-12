import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// ////////////////////////////////////////////////////////////////////////////

describe('Testing email address input', () => {
  // email address is used by another user
  test('email address is already used by another user', () => {
    requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  // email address does not satisfy isEmail
  test.each([
    'invalidunsw.edu.au', 'invalidemailslkcom',
    'invalid@emailcom', 'yrigushfsgpishfd',
    '34678893487', '#$%^&*()&*()',

  ])('invalid email address', (email) => {
    const res = requestAuthRegister(email, 'abcd1234', 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Testing first name', () => {
  // NameFirst contains characters other than lowercase
  // letters, uppercase letters, spaces, hyphens, or apostrophes.
  test.each([
    '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
    '_', '+', '=', '{', '[', '}', ']', '|', '\\', ':', ';', '"', '<', ',',
    '>', '.', '?', '/', '1',
  ])('first name containing invalid charcters', (char) => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first' + char, 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  // NameFirst is less than 2 characters or more than 20 characters.
  test.each([
    'a', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('first name is an invalid length', (first) => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', first, 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Testing last name', () => {
  // NameLast contains characters other than lowercase
  // letters, uppercase letters, spaces, hyphens, or apostrophes.
  test.each([
    '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
    '_', '+', '=', '{', '[', '}', ']', '|', '\\', ':', ';', '"', '<', ',',
    '>', '.', '?', '/', '1',
  ])('last name containing invalid charcters', (char) => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last' + char);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  // NameLast is less than 2 characters or more than 20 characters.
  test.each([
    'a', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('last name is an invalid length', (last) => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', last);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Testing password', () => {
  // Password is less than 8 characters.
  test('Invalid password length', () => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abc123', 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  // Password does not contain at least one number and at least one letter.
  test.each([
    'abcdefgh', '12345678', 'shfvfhj^&&*%', '253768%&^*',
  ])('Password does not contain at least one number and one letter', (password) => {
    const res = requestAuthRegister('email@unsw.edu.au', password, 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('Testing that information has been correctly registered', () => {
  // Registers correct details to the database
  // checks that user array is able to be navigated to get access to correct information

  // checks for correct return type
  test('Returns correct object type', () => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data.token).toStrictEqual(expect.any(String));
    expect(res.statusCode).toStrictEqual(200);
  });

  // checks that user was added to database
  test('User information successfully added to database', () => {
    const res1 = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    const token = JSON.parse(res1.body.toString()).token;

    const res2 = requestUserDetails(token);
    const data = JSON.parse(res2.body.toString());

    expect(data).toStrictEqual({
      user: {
        authUserId: expect.any(Number),
        name: 'first last',
        email: 'email@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordSinceLastLogin: 0,
      }
    });

    expect(res2.statusCode).toStrictEqual(200);
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
