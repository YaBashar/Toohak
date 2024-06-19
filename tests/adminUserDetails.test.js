import { adminAuthRegister, adminUserDetails } from '../src/auth.js';
import { clear } from '../src/other.js';

beforeEach(() => {
    clear();
});

describe('Testing user details retrieval', () => {
  
  // AuthUserId is not a valid user.
  test('Invalid AuthUserId', () => {
    const result = adminUserDetails('randomstring');
    expect(result).toStrictEqual({error: expect.any(String)});
  });

  // Successful user details retrieval.
  test('Successful user details retrieval', () => {
    const id = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
    const result = adminUserDetails(id);

    expect(result).toStrictEqual({
      user: {
        userId: 1,
        name: 'first last',
        email: 'zid@unsw.edu.au',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

});
