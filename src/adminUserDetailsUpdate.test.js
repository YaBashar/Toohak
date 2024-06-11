import { adminUserDetailsUpdate, adminAuthRegister } from './auth.js'
import { clear } from './other.js'

beforeEach(() => {
    clear();
    adminAuthRegister('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
});

// Email is currently used by another user (excluding the current authorised user)
test('Email is already used by another user', () => {
    clear();
    let authId = adminAuthRegister('steph@unsw.edu.au', 'Farmingsimulator!1234', 'steph', 'liang');
    let authUserId1 = adminUserDetailsUpdate (authId.authUserId, 'amelia@unsw.ed.au', 'steph', 'liang');
    expect(authUserId1).toStrictEqual({error: "Email is already used"});
});