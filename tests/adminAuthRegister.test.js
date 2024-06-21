import { adminAuthRegister } from '../src/auth.js';
import { clear } from '../src/other.js';
import isEmail from 'validator/lib/isEmail.js';

beforeEach(() => {
    clear();
});


describe('Testing email address input', () => {

  // email address is used by another user
    test('email address is already used by another user', () => {
      adminAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
      const result = adminAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
      expect(result).toStrictEqual({
        error: 'email is used by another user'
      });
    });

  // email address does not satisfy isEmail 
  test.each([
    'invalidunsw.edu.au', 'invalidemailslkcom',
    'invalid@emailcom', 'yrigushfsgpishfd',
    '34678893487', '#$%^&*()&*()',
  
  ])('invalid email address', (email) => {
    const result = adminAuthRegister(email, 'abcd1234', 'first', 'last');
    expect(result).toStrictEqual({
      error: 'email is not a valid email address'
    });
  });

});


describe('Testing first name', () => {

  // NameFirst contains characters other than lowercase
  // letters, uppercase letters, spaces, hyphens, or apostrophes.
  test.each([
    '~','`', '!', '@', '#', '$', '%', '^', '&','*','(',')',
    '_','+','=','{','[','}',']','|','\\',':',';','"','<',',',
    '>','.','?','/','1',
   ])('first name containing invalid charcters', (char) => {
     const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first'+ char, 'last');
     expect(result).toStrictEqual({
        error: 'name contains invalid characters'
     });
   }) 

  // NameFirst is less than 2 characters or more than 20 characters.
  test.each([
    'a', '', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('first name is an invalid length', (first) => {

    const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', first, 'last');
    expect(result).toStrictEqual({
      error: 'first name must be at least 2 characters and no more than 20'
    });
  });

});


describe('Testing last name', () => {

  // NameFirst contains characters other than lowercase
  // letters, uppercase letters, spaces, hyphens, or apostrophes.
  test.each([
    '~','`', '!', '@', '#', '$', '%', '^', '&','*','(',')',
    '_','+','=','{','[','}',']','|','\\',':',';','"','<',',',
    '>','.','?','/','1',
   ])('last name containing invalid charcters', (char) => {
     const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last' + char);
     expect(result).toStrictEqual({
        error: 'name contains invalid characters'
     });
   }) 

  // NameFirst is less than 2 characters or more than 20 characters.
  test.each([
    'a', '', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('first name is an invalid length', (last) => {

    const result = adminAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', last);
    expect(result).toStrictEqual({
      error: 'last name must be at least 2 characters and no more than 20'
    });
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
