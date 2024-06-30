import { adminAuthRegister, adminUserDetails } from '../src/auth.js';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('Testing email address input', () => {
  // email address is used by another user
  test('email address is already used by another user', () => {
    adminAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    const result = adminAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    expect(result).toStrictEqual({
      error: 'email is used by another user'
    });
  });

  // email address does not satisfy isEmail
  test.each([
    'invalidunsw.edu.au', 'invalidemailslkcom',
    'invalid@emailcom', 'yrigushfsgpishfd',
    '34678893487', '#$%^&*()&*()',

  ])('invalid email address', (email) => {
    const result = adminAuthRegister(email, 'abcd1234', 'first', 'last');
    expect(result).toStrictEqual({
      error: 'email is not a valid email address'
    });
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
    const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first' + char, 'last');
    expect(result).toStrictEqual({
      error: 'name contains invalid characters'
    });
  });

  // NameFirst is less than 2 characters or more than 20 characters.
  test.each([
    'a', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('first name is an invalid length', (first) => {
    const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', first, 'last');
    expect(result).toStrictEqual({
      error: 'first name must be at least 2 characters and no more than 20'
    });
  });
});

describe('Testing last name', () => {
  // NameFirst contains characters other than lowercase
  // letters, uppercase letters, spaces, hyphens, or apostrophes.
  test.each([
    '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
    '_', '+', '=', '{', '[', '}', ']', '|', '\\', ':', ';', '"', '<', ',',
    '>', '.', '?', '/', '1',
  ])('last name containing invalid charcters', (char) => {
    const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last' + char);
    expect(result).toStrictEqual({
      error: 'name contains invalid characters'
    });
  });

  // NameFirst is less than 2 characters or more than 20 characters.
  test.each([
    'a', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('first name is an invalid length', (last) => {
    const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', last);
    expect(result).toStrictEqual({
      error: 'last name must be at least 2 characters and no more than 20'
    });
  });
});

describe('Testing password', () => {
  // Password is less than 8 characters.
  test('Invalid password length', () => {
    const result = adminAuthRegister('zid@unsw.edu.au',
      'abcd123', 'first', 'last');
    expect(result).toStrictEqual({
      error: 'password must be at least 8 characters'
    });
  });

  // Password does not contain at least one number and at least one letter.
  test.each([
    'abcdefgh', '12345678', 'shfvfhj^&&*%', '253768%&^*',
  ])('Password does not contain at least one number and one letter', (password) => {
    const result = adminAuthRegister('zid@unsw.edu.au',
      password, 'first', 'last');
    expect(result).toStrictEqual({
      error: 'password must contain at least one number and one letter'
    });
  });
});

describe('Testing that information has been correctly registered', () => {
  let id;

  beforeEach(() => {
    id = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
  });

  // Registers correct details to the database
  test('Testing one registration', () => {
    expect(adminUserDetails(id)).toStrictEqual({
      user:
        {
          userId: id.authUserId,
          name: 'first last',
          email: 'zid@unsw.edu.au',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        }
    });
  });

  // checks that user array is able to be navigated to get access to correct information
  test('Testing multiple registrations', () => {
    adminAuthRegister('zid2@unsw.edu.au', 'abcd1234', 'first', 'last');
    const uid = adminAuthRegister('zid3@unsw.edu.au', 'abcd1234', 'first', 'last');
    adminAuthRegister('zid4@unsw.edu.au', 'abcd1234', 'first', 'last');

    expect(adminUserDetails(uid)).toStrictEqual({
      user:
        {
          userId: uid.authUserId,
          name: 'first last',
          email: 'zid3@unsw.edu.au',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        }
    });
  });
});

// checks for correct return type
test('Returns correct object type', () => {
  const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
  expect(result).toStrictEqual(
    { authUserId: expect.any(Number) }
  );
});
