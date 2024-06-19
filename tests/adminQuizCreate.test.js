import { adminQuizCreate } from "../src/quiz.js";
import { adminAuthRegister } from "../src/auth.js";
import { clear } from "../src/other.js";

let authUserId;

beforeEach(() => {
  clear();
});

describe('Testing for adminQuizCreate', () => {
  const authUserId = adminAuthRegister('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh').authUserId;
  test("AuthUserId is invalid", () => {
    const result = adminQuizCreate('invalidAuthUserId', 'Sidak', 'valid description');
    expect(result).toStrictEqual({ error: 'Invalid User id' });
  })
  test('Name contains invalid characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', 
                          ':', ';', '-', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];  
    const result = adminQuizCreate(authUserId, 'sid!ak', 'valid description');
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
  test('Name is already used by current logged in user', () => {
    adminQuizCreate(authUserId, 'Sidak', 'valid description');
    const result = adminQuizCreate(authUserId, 'Sidak', 'description');
    expect(result).toStrictEqual( {error: expect.any(String)} );
  });
  test('Description is more than 100 characters', () => {
    const longDescription = 'a'.repeat(101);
    const result = adminQuizCreate(authUserId, 'Sidak', longDescription);
    expect(result).toStrictEqual({error: 'Description is more than 100 characters in length'})
  });
  test('Quiz created successfully', () => {
    const result = adminQuizCreate(authUserId, 'john', 'toohak quiz');
    //quiz created successfully
    expect(result).toStrictEqual({ quizId: expect.any(Number) });
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////



