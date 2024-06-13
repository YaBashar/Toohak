import {adminAuthRegister} from './auth.js';
import {adminAuthLogin} from './auth.js';
import {clear} from './other.js';

beforeEach(() => {
    clear();
});

describe('Testing login', () => {

  // Email address does not exist.
  test('Email address does not exist', () => {
    const result = adminAuthLogin('zid@unsw.edu.au', 'abcd1234');
    expect(result).toStrictEqual({error: expect.any(String)});
  });

  // Password is not correct for the given email.
  test('Incorrect password', () => {
    adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
    const result = adminAuthLogin('zid@unsw.edu.au', '1234abcd');
    expect(result).toStrictEqual({error: expect.any(String)});
  });

});


