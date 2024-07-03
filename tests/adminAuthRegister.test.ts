import request from 'sync-request-curl';
import { port, url } from '../src/config.json'

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;


beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

///////////////////////////////////////////////////////////////////////////////


describe('Testing email address input', () => {
  // email address is used by another user
  test('email address is already used by another user', () => {
    requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'email is used by another user'});
    expect(res.statusCode).toStrictEqual(400);
  });

  // email address does not satisfy isEmail 
  test.each([
    'invalidunsw.edu.au', 'invalidemailslkcom',
    'invalid@emailcom', 'yrigushfsgpishfd',
    '34678893487', '#$%^&*()&*()',
  
  ])('invalid email address', (email) => {
    const res = requestAuthRegister(email, 'abcd1234', 'first', 'last');
    const data = JSON.parse(res.body.toString());
    
    expect(data).toStrictEqual({error: 'email is not a valid email address'});
    expect(res.statusCode).toStrictEqual(400);
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
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first' + char, 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'name contains invalid characters'});
    expect(res.statusCode).toStrictEqual(400);
   }) 


  // NameFirst is less than 2 characters or more than 20 characters.
  test.each([
    'a', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('first name is an invalid length', (first) => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', first, 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'first name must be at least 2 characters and no more than 20'});
    expect(res.statusCode).toStrictEqual(400);
  });

});


describe('Testing last name', () => {
  // NameLast contains characters other than lowercase
  // letters, uppercase letters, spaces, hyphens, or apostrophes.
  test.each([
    '~','`', '!', '@', '#', '$', '%', '^', '&','*','(',')',
    '_','+','=','{','[','}',']','|','\\',':',';','"','<',',',
    '>','.','?','/','1',
   ])('last name containing invalid charcters', (char) => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', 'last' + char);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'name contains invalid characters'});
    expect(res.statusCode).toStrictEqual(400);
   }) 

  // NameLast is less than 2 characters or more than 20 characters.
  test.each([
    'a', ' ', 'abcdefghijklmnopqrstu',
    'abcdefghijk-lmnopqrstuvwxyz',
  ])('last name is an invalid length', (last) => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abcd1234', 'first', last);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'last name must be at least 2 characters and no more than 20'});
    expect(res.statusCode).toStrictEqual(400);
  });

});

describe('Testing password', () => {
  // Password is less than 8 characters.
  test('Invalid password length', () => {
    const res = requestAuthRegister('email@unsw.edu.au', 'abc123', 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'password must be at least 8 characters' });
    expect(res.statusCode).toStrictEqual(400);
  });

  // Password does not contain at least one number and at least one letter.
  test.each([
    'abcdefgh', '12345678', 'shfvfhj^&&*%', '253768%&^*',
  ])('Password does not contain at least one number and one letter', (password) => {
    const res = requestAuthRegister('email@unsw.edu.au', password, 'first', 'last');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'password must contain at least one number and one letter'});
    expect(res.statusCode).toStrictEqual(400);
  });

});


describe('Testing that information has been correctly registered', () => {
});


const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register', { 
    json: {email, password, nameFirst, nameLast}, timeout: TIMEOUT_MS
  }));
}