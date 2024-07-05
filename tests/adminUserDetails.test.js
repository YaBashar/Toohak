import { adminAuthRegister, adminUserDetails, adminAuthLogin } from '../src/auth';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('Testing error cases', () => {
  // AuthUserId is not a valid user.
  test('Invalid AuthUserId', () => {
    const result = adminUserDetails('randomstring');
    expect(result).toStrictEqual({ error: 'Invalid AuthUserId' });
  });
});

describe('Testing successful user details retrieval', () => {
  let id;

  beforeEach(() => {
    id = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
  });

  // Successful user details retrieval - one user.
  test('Details retrival with one registered user', () => {
    const result = adminUserDetails(id);
    expect(result).toStrictEqual({
      user: {
        userId: id.authUserId,
        name: 'first last',
        email: 'zid@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  // Successful user details retrieval - multiple users
  test('Details retrieval with multiple registered users', () => {
    adminAuthRegister('zid1@unsw.edu.au', 'abcd1234', 'first', 'last');
    const uid = adminAuthRegister('zid2@unsw.edu.au', 'abcd1234', 'first', 'last');
    adminAuthLogin('zid2@unsw.edu.au', 'abcd1234');
    adminAuthRegister('zid3@unsw.edu.au', 'abcd1234', 'first', 'last');

    const result = adminUserDetails(uid);

    expect(result).toStrictEqual({
      user: {
        userId: uid.authUserId,
        name: 'first last',
        email: 'zid2@unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });
});
