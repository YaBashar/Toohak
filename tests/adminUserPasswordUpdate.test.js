import { adminUserPasswordUpdate, adminAuthRegister } from './auth.js'
import { clear } from './other.js'

let authUserId;

beforeEach(() => {
  clear();
  authUserId = adminAuthRegister('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su').authUserId;
});

describe('Testing for errors', () => {
  // AuthUserId isn't valid

  // Old password is not correct

  // Old password and new password are the same

  // New password has been used before

  // New password is too short

  // New password doesn't contain at least on number and one letter
  
});