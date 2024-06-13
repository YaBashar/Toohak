import {adminUserDetails} from './auth.js';
import {clear} from './other.js';

beforeEach(() => {
    clear();
});

describe('Testing user details retrieval', () => {
  
  //AuthUserId is not a valid user.
  test('Invalid AuthUserId', () => {
    const result1 = adminUserDetails('randomstring');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminUserDetails(1);
    expect(result2).toStrictEqual({error: expect.any(String)});
  });

});
