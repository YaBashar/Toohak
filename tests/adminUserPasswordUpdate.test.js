import { adminUserPasswordUpdate, adminAuthRegister } from '../src/auth.js'
import { clear } from '../src/other.js'

let user;
let id;

beforeEach(() => {
  clear();
  user = adminAuthRegister('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
  id = user.authUserId;
  console.log(id);
});

describe('Testing for errors', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const result1 = adminUserPasswordUpdate('randomstring', 'abcd1234!@#$ABCD', 'newabcd1234!@#$ABCD');
    expect(result1).toStrictEqual({ error: 'invalid userId' });

    const result2 = adminUserPasswordUpdate('1', 'abcd1234!@#$ABCD', 'newabcd1234!@#$ABCD');
    expect(result2).toStrictEqual({ error: 'invalid userId' });
  });

  // Old password is not correct
  test('Incorrect password', () => {
    const result = adminUserPasswordUpdate(id, 'abcd1234!@#$ABC', 'newabcd1234!@#$ABCD');
    expect(result).toStrictEqual({ error: 'incorrect password' });
  });

  // Old password and new password are the same
  test.only('Old password is the same as the new password', () => {
    const result1 = adminUserPasswordUpdate(id, 'abcd1234!@#$ABCD', 'abcd1234!@#$ABCD');
    expect(result1).toStrictEqual({ error: 'new password is the same as old password' });
  });

  // New password has been used before
  test('New password has been used before', () => {
    const result1 = adminUserPasswordUpdate(id, 'abcd1234!@#$ABCD', 'abcd1234!@#$ABC');
    const result2 = adminUserPasswordUpdate(id, 'abcd1234!@#$ABC', 'abcd1234!@#$ABCD');
    expect(result2).toStrictEqual({ error: 'password has already been used' });
  });

  // New password is too short
  test('Invalid password length', () => {
    const result1 = adminUserPasswordUpdate(id, 'abcd1234!@#$ABCD', 'abcd123');
    expect(result1).toStrictEqual({ error: 'password is too short' });
  });

  // New password doesn't contain at least on number and one letter
  test('Password does not contain at least one number and one letter', () => {
    const result1 = adminUserPasswordUpdate(id, 'abcd1234!@#$ABCD', 'abcdefgh');
    expect(result1).toStrictEqual({ error: 'new password should contain at least one letter and one number'});

    const result2 = adminUserPasswordUpdate(id, 'abcd1234!@#$ABCD', '12345678');
    expect(result2).toStrictEqual({ error: 'new password should contain at least one letter and one number'});
  });
});