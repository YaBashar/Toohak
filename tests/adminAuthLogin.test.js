import { adminAuthRegister, adminAuthLogin } from '../src/auth.js';
import { clear } from '../src/other.js';

beforeEach(() => {
    clear();
});

describe('Testing login', () => {

  // Email address does not exist.
  test('Email address does not exist', () => {
    const result = adminAuthLogin('zid@unsw.edu.au', 'abcd1234');
    expect(result).toStrictEqual({error: 'Email address does not exist'});
  });

  // Password is not correct for the given email.
  test('Incorrect password', () => {
    adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
    const result = adminAuthLogin('zid@unsw.edu.au', '1234abcd');
    expect(result).toStrictEqual({error: 'Incorrect password'});
  });

  // Successful Login
  test('Successful login', () => {
    adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
    const result = adminAuthLogin('zid@unsw.edu.au', 'abcd1234');
    expect(result).toStrictEqual({authUserId: 1});
  })

});


