import { adminAuthRegister } from '../src/auth.js';
import { clear } from '../src/other.js';
import isEmail from 'validator/lib/isEmail.js';

beforeEach(() => {
    clear();
});


describe('Testing email address', () => {

  // Email address is used by another user.
  test('Email address is already registered', () => {
    adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
    const result = adminAuthRegister('zid@unsw.edu.au', 'defg4567',
                                       'first', 'last');
    expect(result).toStrictEqual({error: expect.any(String)});
  });

  // Email does not satisfy validator.isEmail function.
  test('Provided email is not a valid email address', () => {
    const result1 = adminAuthRegister('invalidunsw.edu.au', 
                                        'abcd1234', 'first', 'last');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminAuthRegister('invalidemailslkcom', 
                                        'abcd1234', 'first', 'last');
    expect(result2).toStrictEqual({error: expect.any(String)});

    const result3 = adminAuthRegister('invalid@emailcom', 
                                        'abcd1234', 'first', 'last');
    expect(result3).toStrictEqual({error: expect.any(String)});
  });

});


describe('Testing first name', () => {

  // NameFirst contains characters other than lowercase
  // letters, uppercase letters, spaces, hyphens, or apostrophes.
  test('First name contains invalid characters', () => {
    const result1 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first~', 'last');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first`', 'last');
    expect(result2).toStrictEqual({error: expect.any(String)});

    const result3 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first!', 'last');
    expect(result3).toStrictEqual({error: expect.any(String)});

    const result4 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first@', 'last');
    expect(result4).toStrictEqual({error: expect.any(String)});

    const result5 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first#', 'last');
    expect(result5).toStrictEqual({error: expect.any(String)});

    const result6 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first$', 'last');
    expect(result6).toStrictEqual({error: expect.any(String)});

    const result7 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first%', 'last');
    expect(result7).toStrictEqual({error: expect.any(String)});

    const result8 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first^', 'last');
    expect(result8).toStrictEqual({error: expect.any(String)});

    const result9 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first&', 'last');
    expect(result9).toStrictEqual({error: expect.any(String)});

    const result10 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first*', 'last');
    expect(result10).toStrictEqual({error: expect.any(String)});

    const result11 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first(', 'last');
    expect(result11).toStrictEqual({error: expect.any(String)});

    const result12 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first)', 'last');
    expect(result12).toStrictEqual({error: expect.any(String)});

    const result13 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first_', 'last');
    expect(result13).toStrictEqual({error: expect.any(String)});

    const result14 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first+', 'last');
    expect(result14).toStrictEqual({error: expect.any(String)});

    const result15 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first=', 'last');
    expect(result15).toStrictEqual({error: expect.any(String)});

    const result16 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first{', 'last');
    expect(result16).toStrictEqual({error: expect.any(String)});

    const result17 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first[', 'last');
    expect(result17).toStrictEqual({error: expect.any(String)});

    const result18 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first]', 'last');
    expect(result18).toStrictEqual({error: expect.any(String)});

    const result19 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first}', 'last');
    expect(result19).toStrictEqual({error: expect.any(String)});

    const result20 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first|', 'last');
    expect(result20).toStrictEqual({error: expect.any(String)});

    const result21 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first\\', 'last');
    expect(result21).toStrictEqual({error: expect.any(String)});

    const result22 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first:', 'last');
    expect(result22).toStrictEqual({error: expect.any(String)});

    const result23 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first;', 'last');
    expect(result23).toStrictEqual({error: expect.any(String)});

    const result24 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first"', 'last');
    expect(result24).toStrictEqual({error: expect.any(String)});

    const result25 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first<', 'last');
    expect(result25).toStrictEqual({error: expect.any(String)});

    const result26 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first,', 'last');
    expect(result26).toStrictEqual({error: expect.any(String)});

    const result27 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first>', 'last');
    expect(result27).toStrictEqual({error: expect.any(String)});

    const result28 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first.', 'last');
    expect(result28).toStrictEqual({error: expect.any(String)});

    const result29 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first?', 'last');
    expect(result29).toStrictEqual({error: expect.any(String)});

    const result30 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first/', 'last');
    expect(result30).toStrictEqual({error: expect.any(String)});

    const result31 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first1', 'last');
    expect(result31).toStrictEqual({error: expect.any(String)});
  });

  // NameFirst is less than 2 characters or more than 20 characters
  test('Invalid length of first name', () => {
    const result1 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'f,', 'last');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 
                                       'abcdefghijklmnopqrstu,', 'last');
    expect(result2).toStrictEqual({error: expect.any(String)});
  });

});


describe('Testing email address', () => {

  // NameLast contains characters other than lowercase letters, 
  // uppercase letters, spaces, hyphens, or apostrophes.
  test('Last name contains invalid characters', () => {
    const result1 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last~');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last`');
    expect(result2).toStrictEqual({error: expect.any(String)});

    const result3 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last!');
    expect(result3).toStrictEqual({error: expect.any(String)});

    const result4 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last@');
    expect(result4).toStrictEqual({error: expect.any(String)});

    const result5 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last#');
    expect(result5).toStrictEqual({error: expect.any(String)});

    const result6 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last$');
    expect(result6).toStrictEqual({error: expect.any(String)});

    const result7 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last%');
    expect(result7).toStrictEqual({error: expect.any(String)});

    const result8 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last^');
    expect(result8).toStrictEqual({error: expect.any(String)});

    const result9 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first', 'last&');
    expect(result9).toStrictEqual({error: expect.any(String)});

    const result10 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last*');
    expect(result10).toStrictEqual({error: expect.any(String)});

    const result11 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last(');
    expect(result11).toStrictEqual({error: expect.any(String)});

    const result12 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last)');
    expect(result12).toStrictEqual({error: expect.any(String)});

    const result13 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last_');
    expect(result13).toStrictEqual({error: expect.any(String)});

    const result14 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last+');
    expect(result14).toStrictEqual({error: expect.any(String)});

    const result15 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last=');
    expect(result15).toStrictEqual({error: expect.any(String)});

    const result16 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last{');
    expect(result16).toStrictEqual({error: expect.any(String)});

    const result17 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last[');
    expect(result17).toStrictEqual({error: expect.any(String)});

    const result18 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last]');
    expect(result18).toStrictEqual({error: expect.any(String)});

    const result19 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last}');
    expect(result19).toStrictEqual({error: expect.any(String)});

    const result20 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first', 'last|');
    expect(result20).toStrictEqual({error: expect.any(String)});

    const result21 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first\\', 'last');
    expect(result21).toStrictEqual({error: expect.any(String)});

    const result22 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first:', 'last');
    expect(result22).toStrictEqual({error: expect.any(String)});

    const result23 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first;', 'last');
    expect(result23).toStrictEqual({error: expect.any(String)});

    const result24 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first"', 'last');
    expect(result24).toStrictEqual({error: expect.any(String)});

    const result25 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first<', 'last');
    expect(result25).toStrictEqual({error: expect.any(String)});

    const result26 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first,', 'last');
    expect(result26).toStrictEqual({error: expect.any(String)});

    const result27 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first>', 'last');
    expect(result27).toStrictEqual({error: expect.any(String)});

    const result28 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first.', 'last');
    expect(result28).toStrictEqual({error: expect.any(String)});

    const result29 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first?', 'last');
    expect(result29).toStrictEqual({error: expect.any(String)});

    const result30 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first/', 'last');
    expect(result30).toStrictEqual({error: expect.any(String)});

    const result31 = adminAuthRegister('zid@unsw.edu.au', 
                                         'abcd1234', 'first1', 'last');
    expect(result31).toStrictEqual({error: expect.any(String)});
  });

  // NameLast is less than 2 characters or more than 20 characters.
  test('Invalid length of first name', () => {
    const result1 = adminAuthRegister('zid@unsw.edu.au', 
                                        'abcd1234', 'first,', 'l');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 
                                       'first,', 'abcdefghijklmnopqrstu');
    expect(result2).toStrictEqual({error: expect.any(String)});
  });

});


describe('Testing password', () => {

  // Password is less than 8 characters.
  test('Invalid password length', () => {
    const result1 = adminAuthRegister('zid@unsw.edu.au', 
        'abcd123', 'first,', 'last');

    expect(result1).toStrictEqual({error: expect.any(String)});
  });

  // Password does not contain at least one number and at least one letter.
  test('Password does not contain at least one number and one letter', () => {
    const result1 = adminAuthRegister('zid@unsw.edu.au', 
        'abcdefgh', 'first,', 'last');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminAuthRegister('zid@unsw.edu.au', 
        '12345678', 'first,', 'last');
    expect(result2).toStrictEqual({error: expect.any(String)});
  });

});
