import { adminUserPasswordUpdate, adminAuthRegister } from './auth.js'
import { clear } from './other.js'

let authUserId;

beforeEach(() => {
  clear();
  authUserId = adminAuthRegister('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su').authUserId;
});

describe('Testing for errors', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const result1 = adminUserPasswordUpdate('randomstring', 'abcd1234!@#$ABCD', 'newabcd1234!@#$ABCD');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminUserPasswordUpdate(1, 'abcd1234!@#$ABCD', 'newabcd1234!@#$ABCD');
    expect(result2).toStrictEqual({error: expect.any(String)});
  });

  // Old password is not correct
  test('Incorrect password', () => {
    const result = adminUserPasswordUpdate(authUserId, 'abcd1234!@#$ABC', 'newabcd1234!@#$ABCD');
    expect(result).toStrictEqual({error: expect.any(String)});
  });

  // Old password and new password are the same
  test('Old password is the same as the new password', () => {
    const result1 = adminUserPasswordUpdate(authUserId, 'abcd1234!@#$ABCD', 'abcd1234!@#$ABCD');
    expect(result1).toStrictEqual({error: expect.any(String)});
  });

  // New password has been used before
  test('New password has been used before', () => {
    const result1 = adminUserPasswordUpdate(authUserId, 'abcd1234!@#$ABCD', 'abcd1234!@#$ABC');
    const result2 = adminUserPasswordUpdate(authUserId, 'abcd1234!@#$ABC', 'abcd1234!@#$ABCD');
    expect(result2).toStrictEqual({error: expect.any(String)});
  });

  // New password is too short
  test('Invalid password length', () => {
    const result1 = adminUserPasswordUpdate(authUserId, 'abcd1234!@#$ABCD', 'abcd123');
    expect(result1).toStrictEqual({error: expect.any(String)});
  });

  // New password doesn't contain at least on number and one letter
  test('Password does not contain at least one number and one letter', () => {
    const result1 = adminUserPasswordUpdate(authUserId, 'abcd1234!@#$ABCD', 'abcdefgh');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminUserPasswordUpdate(authUserId, 'abcd1234!@#$ABCD', '12345678');
    expect(result2).toStrictEqual({error: expect.any(String)});
  });
});