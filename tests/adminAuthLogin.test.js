import { adminAuthRegister, adminAuthLogin, adminUserDetails } from '../src/auth';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('Testing login error cases', () => {
  beforeEach(() => {
    adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
  });

  // Email address does not exist.
  test('Email address does not exist', () => {
    const result = adminAuthLogin('zid2@unsw.edu.au', 'abcd1234');
    expect(result).toStrictEqual({ error: 'Email address does not exist' });
  });

  // Password is not correct for the given email.
  test('Incorrect password', () => {
    const result = adminAuthLogin('zid@unsw.edu.au', '1234abcd');
    expect(result).toStrictEqual({ error: 'Incorrect password' });
  });
});

describe('Testing login success cases', () => {
  let id;

  beforeEach(() => {
    id = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
  });

  // Successful Login return type
  test('Successful login return type', () => {
    const result = adminAuthLogin('zid@unsw.edu.au', 'abcd1234');
    expect(result).toStrictEqual(id);
  });

  // updating the successful login count
  test('numSuccessfulLogins updated', () => {
    adminAuthLogin('zid@unsw.edu.au', 'abcd1234');
    const result = adminUserDetails(id);
    expect(result).toStrictEqual({
      user:
        {
          userId: id.authUserId,
          name: 'first last',
          email: 'zid@unsw.edu.au',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
    });
  });

  // updating the number of failed logins count
  test('numFailedPasswordsSinceLastLogin updated', () => {
    adminAuthLogin('zid@unsw.edu.au', 'wrong_password');
    adminAuthLogin('zid@unsw.edu.au', 'wrong_password');
    adminAuthLogin('zid@unsw.edu.au', 'wrong_password');

    const result = adminUserDetails(id);
    expect(result).toStrictEqual({
      user:
        {
          userId: id.authUserId,
          name: 'first last',
          email: 'zid@unsw.edu.au',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 3,
        }
    });
  });
});
