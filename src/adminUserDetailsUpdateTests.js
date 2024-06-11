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
        const result = adminUserDetailsUpdate(authUserId, 'gurigiurabgiurag', 'ameila', 'su');
        expect(result).toStrictEqual({ error: expect.any(String) })
    });

})