import { adminUserDetailsUpdate, adminAuthRegister } from './auth.js'
import { clear } from './other.js'

let authUserId;

beforeEach(() => {
  clear();
  authUserId = adminAuthRegister('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su').authUserId;
});

describe('Testing for errors', () => {
  // Email is currently used by another user (excluding the current authorised user)
  test('Email is already used by another user', () => {
    const authUserId2 = adminAuthRegister('steph@unsw.edu.au', 'Farmingsimulator!1234', 'steph', 'liang');
    const result = adminUserDetailsUpdate (authUserId2.authUserId, 'amelia@unsw.ed.au', 'steph', 'liang');
    expect(result).toStrictEqual({error: expect.any(String)});
  });

  // Email is not valid
  test('Email is not a valid email', () => {
    const result = adminUserDetailsUpdate(authUserId, 'gurigiurabgiurag', 'amelia', 'su');
    expect(result).toStrictEqual({ error: expect.any(String) })
  });

  // First/last name contains invalid characters
  test('First name contains invalid characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', 
                          ':', ';', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'a!melia', 'su');
    expect(result).toStrictEqual({ error: expect.any(String) })
  });

  test('Last name contains invalid characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', 
                          ':', ';', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'amelia', 'su+');
    expect(result).toStrictEqual({ error: expect.any(String) })
  });

  // First/last name is too short or too long
  test('First name is too short', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'a', 'su')
  });

  test('First name is too long', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'abcdefghijklmnopqrstuv', 'su')
  });

  test('Last name is too short', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'amelia', 's')
  });

  test('Last name is too long', () => {
    const result = adminUserDetailsUpdate(authUserId, 'amelia@unsw.ed.au', 'amelia', 'abcdefghijklmnopqrstuv')
  });
});