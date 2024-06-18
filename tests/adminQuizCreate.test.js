import { adminQuizCreate } from "../src/quiz.js";
import { adminAuthRegister } from "../src/auth.js";
import { clear } from "../src/other.js";

let authUserId;

beforeEach(() => {
  clear();
  authUserId = adminAuthRegister('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
});

describe('Testing for errors', () => {
  test('AuthUserId is not a valid user', () => {
    //
    const invalidUserId = 'invalidUserId';
    const result = adminQuizCreate(invalidUserId, 'name', 'description')
    expect(result).toStrictEqual({ error: 'Invalid user id'})
  });
  test('Name contains invalid characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', 
                          ':', ';', '-', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];  
    const result = adminQuizCreate(authUserId, 'sidak', 'valid description');
    expect(result).toStrictEqual({ error: expect.any(String) })
  });

  test('Name is too short', () => {
    const result = adminQuizCreate(authUserId, 's', 'valid description')
    expect(result).toStrictEqual({error : 'name is less than 3 characters'})
  });
  test('Name is too long', () => {
    const result = adminQuizCreate(authUserId, 'abcdefghijklmnopqrstuvwxyzabcde', 'valid description')
    expect(result).toStrictEqual({error : 'name is more than 30 characters'})
  });
  test('Name is already used by current user', () => {
    // Name is already used by the current logged in user for another quiz.
    
  });
  test('Description is more than 100 characters', () => {
    //  Description is more than 100 characters in length (note: empty strings are OK)
    const longDescription = 'a'.repeat(101);
    const result = adminQuizCreate(authUserId, 'Sidak', longDescription);
    expect(result).toStrictEqual({error: 'Description is more than 100 characters in length'})
  });
});
