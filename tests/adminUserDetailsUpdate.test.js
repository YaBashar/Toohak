import { adminUserDetailsUpdate, adminAuthRegister } from '../src/auth.js'
import { clear } from '../src/other.js'

let authUserId;

beforeEach(() => {
  clear();
  authUserId = adminAuthRegister('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su').authUserId;
});

describe('Testing adminUserDetailsUpdate for errors', () => {
  test('User Id is not valid', () => {
    const result = adminUserDetailsUpdate(hello, 'amelia1@unsw.edu.au', 'amelia', 'su');
    expect(result).toStrictEqual({ error: 'invalid userId' });
  });

  // Email is currently used by another user (excluding the current authorised user)
  test('Email is already used by another user', () => {
    const authUserId2 = adminAuthRegister('steph@unsw.edu.au', 'Farmingsimulator!1234', 'steph', 'liang');
    const result = adminUserDetailsUpdate (authUserId2.authUserId, 'amelia@unsw.ed.au', 'steph', 'liang');
    expect(result).toStrictEqual({ error: 'email used by another user' });
  });

  // Email is not valid
  test('Email is not a valid email', () => {
    const result = adminUserDetailsUpdate(authUserId, 'gurigiurabgiurag', 'amelia', 'su');
    expect(result).toStrictEqual({ error: 'invalid email address' })
  });

  // First/last name contains invalid characters
  test('First name contains invalid characters', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'a!melia', 'su');
    expect(result).toStrictEqual({ error: 'first name contains invalid characters' })
  });

  test('Last name contains invalid characters', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'amelia', 'su+');
    expect(result).toStrictEqual({ error: 'last name contains invalid characters' });
  });

  // First/last name is too short or too long
  test('First name is too short', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'a', 'su');
    expect(result).toStrictEqual({ error: 'first name is too short' });
  });

  test('First name is too long', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'abcdefghijklmnopqrstuv', 'su');
    expect(result).toStrictEqual({ error: 'first name is too long'});
  });

  test('Last name is too short', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'amelia', 's');
    expect(result).toStrictEqual({ error: 'last name is too short' });
  });

  test('Last name is too long', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unw.ed.au', 'amelia', 'abcdefghijklmnopqrstuv');
    expect(result).toStrictEqual({ error: 'last name is too long' });
  });

  // successful use of function
  test('function used correctly', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia1@unsw.edu.au', 'amelia', 'su');
    expect(result).toStrictEqual({});
  });
});